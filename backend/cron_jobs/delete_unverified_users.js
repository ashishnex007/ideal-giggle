const cron = require('node-cron');
const { User } = require('../models/userModel'); 
const chalk = require('chalk');


function deleteUsers(){

    console.log(chalk.green('Cron job started'));
    // 7 days of time limit for stale accounts 
    const STALE_ACCOUNT_TIME_LIMIT = 7 * 24 * 60 * 60 * 1000;
    
    // runs daily midnight
    cron.schedule('0 0 * * *', async () => {
        try {

            // timestamp representing the cutoff time
            const cutoffTime = new Date(Date.now() - STALE_ACCOUNT_TIME_LIMIT);
    
            // unverified accounts created before the cutoff time
            const staleAccounts = await User.find({
                verified: false,
                createdAt: { $lt: cutoffTime}
            });
    
            await Promise.all(staleAccounts.map(async account => {
                console.log(chalk.redBright(`Deleting stale unverified account: ${account.email}`))
                await User.deleteOne({ _id: account._id })
            }));

            console.log(chalk.redBright(`${staleAccounts.length} stale unverified accounts deleted.`));
        } catch (error) {
            console.error('Error deleting stale unverified accounts:', error);
        }
    });
}

module.exports = deleteUsers;