const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accounts => {
    beforeEach(async function() {
        this.contract = await StarNotary.new({ from: accounts[0] });
    });

    describe('can create a star', () => {
        it('can create a star and get its name', async function() {
            let tokenId = 1;

            await this.contract.createStar(
                'Awesome Star!',
                'I love my wonderful star',
                'ra_032.155',
                'dec_121.874',
                'mag_245.978',
                tokenId,
                { from: accounts[0] }
            );
            const star = await this.contract.tokenIdToStarInfo(tokenId);
            assert.equal(star[0], 'Awesome Star!');
        });

        it('can not create star at same coordinate', async function() {
            let tokenId = 2;
            await this.contract.createStar(
                'Awesome Star!',
                'I love my wonderful star',
                'ra_032.155',
                'dec_121.874',
                'mag_245.978',
                tokenId,
                { from: accounts[0] }
            );
            const star = await this.contract.tokenIdToStarInfo(tokenId);
            assert.equal(star[0], 'Awesome Star!');
            //Create new star with difference name
            try {
                await this.contract.createStar(
                    'Awesome Star2!',
                    'I love my wonderful star',
                    'ra_032.155',
                    'dec_121.874',
                    'mag_245.978',
                    tokenId,
                    { from: accounts[0] }
                );
                assert(false);
            } catch (e) {
                // Need to get catch to prevent adding star
                assert(true);
            } finally {
                // Still get the same name
                const star2 = await this.contract.tokenIdToStarInfo(tokenId);
                assert.equal(star2[0], 'Awesome Star!');
            }
        });
    });

    describe('buying and selling stars', () => {
        let user1 = accounts[1];
        let user2 = accounts[2];

        let starId = 1;
        let starPrice = web3.toWei(0.01, 'ether');

        beforeEach(async function() {
            await this.contract.createStar(
                'Star power 103!',
                'I love my wonderful star',
                'ra_032.155',
                'dec_121.874',
                'mag_245.978',
                starId,
                {
                    from: user1
                }
            );
        });

        describe('user1 can sell a star', () => {
            it('user1 can put up their star for sale', async function() {
                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                });

                assert.equal(
                    await this.contract.starsForSale(starId),
                    starPrice
                );
            });

            it('user1 gets the funds after selling a star', async function() {
                let starPrice = web3.toWei(0.05, 'ether');

                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                });

                let balanceOfUser1BeforeTransaction = web3.eth.getBalance(
                    user1
                );
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: starPrice
                });
                let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1);

                assert.equal(
                    balanceOfUser1BeforeTransaction.add(starPrice).toNumber(),
                    balanceOfUser1AfterTransaction.toNumber()
                );
            });
        });

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function() {
                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                });
            });

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: starPrice
                });

                assert.equal(await this.contract.ownerOf(starId), user2);
            });

            it('user2 correctly has their balance changed', async function() {
                let overpaidAmount = web3.toWei(0.05, 'ether');

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(
                    user2
                );
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: overpaidAmount,
                    gasPrice: 0
                });
                const balanceAfterUser2BuysStar = web3.eth.getBalance(user2);

                assert.equal(
                    balanceOfUser2BeforeTransaction.sub(
                        balanceAfterUser2BuysStar
                    ),
                    starPrice
                );
            });
        });
    });

    describe('star info', () => {
        it('can get star info correctly', async function() {
            const starId = 5;
            const name = 'Star power 103!';
            const story = 'I love my wonderful star';
            const dec = 'dec_121.874';
            const mag = 'mag_245.978';
            const cent = 'ra_032.155';
            await this.contract.createStar(
                name,
                story,
                cent,
                dec,
                mag,
                starId,
                {
                    from: accounts[0]
                }
            );
            const star = await this.contract.tokenIdToStarInfo(starId);
            assert(star[0], name);
            assert(star[1], story);
            assert(star[2], cent);
            assert(star[3], dec);
            assert(star[4], mag);
        });
    });

    describe('star helper', () => {
        it('checkIfStarExist can check coordinate of star is already claim', async function() {
            const starId = 1;
            const dec = 'dec_121.874';
            const mag = 'mag_245.978';
            const cent = 'ra_032.155';
            await this.contract.createStar(
                'Hello Star2',
                'Hello Star 2 is a very large star.',
                cent,
                dec,
                mag,
                starId,
                {
                    from: accounts[0]
                }
            );
            const result = await this.contract.checkIfStarExist(cent, dec, mag);
            assert(result);
        });
        it('checkIfStarExist can check coordinate of star is not claim', async function() {
            const cent = 'ra_032.155';
            const dec = 'dec_121.874';
            const mag = 'mag_245.978';
            const result = await this.contract.checkIfStarExist(cent, dec, mag);
            assert(!result);
        });
    });
});
