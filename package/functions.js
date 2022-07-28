const functions = {
    add: (num1, num2) => num1 + num2,
    squares: (num1) => num1 * num1,
    isNull: () => null,
    checkValue: (x)=> x,
    createUser: () =>{
        const user = { firstName : 'Allan'}
        user['lastName'] = 'Abere';

        return user;
    }
}

module.exports = functions;