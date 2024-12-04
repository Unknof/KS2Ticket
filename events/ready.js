// events/ready.js

function ready() {
    console.log(`Logged in as ${this.user.tag}`);
    this.user.setActivity('tickets | !ticket', { type: 'WATCHING' });
}

module.exports = ready;