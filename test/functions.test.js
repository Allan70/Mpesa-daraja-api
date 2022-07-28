const functions = require('../package/functions')

test('Adds 2 + 2 to equal 4', ()=>{
    expect(functions.add(2,2)).toBe(4);
});

test('Squares 3 to equal 9',()=>{
    expect(functions.squares(3)).toEqual(9);
});

test('Squares 3 to NOT equal 5',()=>{
    expect(functions.squares(3)).not.toEqual(5);
});

test('Adds 2 + 2 to NOT equal 8', ()=>{
    expect(functions.add(2,2)).not.toBe(8);
});

test('Should be null', ()=>{
    expect(functions.isNull()).toBeNull();
});


// CHECK FOR TRUTHY & FALSY VALUES
// toBeNull matches only null
// toBeUndefined matches only undefined
// toBeDefined is the opposite of toBeUndefined
// toBeTruthy matches anything that if statement treats as true
// toBeFalsy mathes anything that an if statemet treats as false
test('Should be falsy', ()=>{

    expect(functions.checkValue(undefined)).toBeFalsy();
});

test('Should NOT be falsy from 1-9', ()=>{
    i = 1;
    while(i < 10){
    expect(functions.checkValue(i)).not.toBeFalsy();
    i++;
    }
});

// toBe is used for primitive types  int, STring while objects and arrays are reference types in JS. They are treated differently as they are stored in different places in the machine.

// toEqual
test('User should be Allan Abere object', ()=>{
    expect(functions.createUser()).toEqual({
        firstName: 'Allan', 
        lastName:'Abere'});
});

// Less than and greater than or to Equal
// toBeLessThan()
// toBeGreaterThan()
// toBeLessThanOrEqual()
// toEqual()
test("Should be under 1600", ()=>{
    const load1 = 800;
    const load2 = 800;
    expect(load1 + load2).toBeLessThanOrEqual(1600)
});

// Regex
// toMatch()
test('There is no I in team', ()=>{
    expect('teamI').toMatch(/I/i);
})

// Arrays
// toContain
test('Admin should be in usernaes', ()=>{
    usernames = ['john', 'karen', 'admin'];
    expect(usernames).toContain('admin');
});

// Working with Asynchronous data with Axios.
// We could use fetch but axios is a little bit easier.
// Install Axios when you have an internet connection to your device.

