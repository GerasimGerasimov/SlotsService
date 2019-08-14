class Greeting {
 
    private greet: string = 'hello!';
 
    constructor() {
        console.log("Say " + this.greet);
    }
}
 
let myGreeting = new Greeting();