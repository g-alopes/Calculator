class CalcController {

	constructor() {
		this._audio = new Audio("click.mp3");
		this._audioOnOff = false;
		this._lastOperator = "";
		this._lastNumber = "";
		this._locale = "pt-BR";
		this._operation = [];
		this._displayCalcEl = document.querySelector("#display");
		this._dateEl = document.querySelector("#data");
		this._timeEl = document.querySelector("#hora");  //If attribute is private, it's necessary write with underline in the beggining and make get and set methods
		this.initialize();
		this.initButtonsEvents();
		this.initKeyboard();
	}

	//Let user copy the result from calculator
	copyToClipboard() {

		let input = document.createElement("input");

		input.value = this.displayCalc;

		document.body.appendChild(input);

		input.select();

		document.execCommand("Copy");

		input.remove();

	}

	//Let user paste a result in the calculator
	pasteFromClipboard() {

		document.addEventListener("paste", e => {

			let text = e.clipboardData.getData("Text");

			this.displayCalc = parseFloat(text);
		});
	}

	initialize() {

		this.setDisplayDateTime();
		
		setInterval(() => {
			this.setDisplayDateTime();
		}, 1000);

		this.setLastNumberToDisplay();

		this.pasteFromClipboard();

		document.querySelectorAll(".btn-ac").forEach(btn => {

			btn.addEventListener("dblclick", e => {

				this.toggleAudio();
			});
		});
	}

	toggleAudio() {

		this._audioOnOff = !this._audioOnOff;
	}

	playAudio() {

		if(this._audioOnOff) {

			this._audio.currentTime = 0;
			this._audio.play();
		}
	}

	initKeyboard() {

		document.addEventListener("keyup", e => {

			this.playAudio();

			switch(e.key) {
				case 'Escape':
					this.clearAll();
					break;
				case 'Backspace':
					this.clearEntry();
					break;
				case '+':
				case '-':
				case '*':
				case '/':
				case '%':
					this.addOperation(e.key);
					break;
				case 'Enter':
				case '=':
					this.calc();
					break;
				case '.':
				case ',':
					this.addDot();
					break;
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					this.addOperation(parseInt(e.key));
					break;
				case 'c':
					if(e.ctrlKey) this.copyToClipboard();
					break;
			}
		});
	}

	addEventListenerAll(element, events, fn) {
		events.split(' ').forEach(event => {
			element.addEventListener(event, fn, false);
		});
	}

	clearAll() {
		this._operation = [];
		this._lastNumber = "";
		this._lastOperator = "";
		this.setLastNumberToDisplay();
		console.log(this._operation);
	}

	clearEntry() {
		this._operation.pop();
		this.setLastNumberToDisplay();
		console.log(this._operation);
	}

	//Return the last position of array
	getLastOperation() {
		return this._operation[this._operation.length - 1];
	}

	isOperator(value) {
		//If the digit is a operator return true, else return false
		return (["+", "-", "*", "/", "%"].indexOf(value) > -1);
	}

	//Set the last position of array
	setLastOperation(value) {
		this._operation[this._operation.length - 1] = value;
	}

	pushOperation(value) {
		this._operation.push(value);

		//Each 3 items of array have to be calculated, delete individual items from array and update the array with the calculated operation
		if(this._operation.length > 3) {
			//Make the calculation
			this.calc();
		}
	}

	//Concatenate the 3 first items of array to String and make the calculation
	getResult() {
		return eval(this._operation.join(""));
	}

	calc() {

		let last = "";

		this._lastOperator = this.getLastItem();

		if(this._operation.length < 3) {

			let firstItem = this._operation[0];
			this._operation = [firstItem, this._lastOperator, this._lastNumber];
		}

		if(this._operation.length > 3) {
			//Get fourth digit typed
			last = this._operation.pop();
			
			this._lastNumber = this.getResult();
		}

		else if(this._operation.length == 3) {
			
			this._lastNumber = this.getLastItem(false);
		}

		let result = this.getResult();

		if(last == "%") {
			result /= 100;
			//Set the array items putting the calculation of the first 3 items in the fisrt position and the fourth position and item 2
			this._operation = [result];
		}

		else {
			//Set the array items putting the calculation of the first 3 items in the fisrt position and the fourth position and item 2
			this._operation = [result];

			if(last) this._operation.push(last);
		}

		this.setLastNumberToDisplay();
	}

	//Get last operator or last number from array. Without any parameter, means it's searching a operator by default
	getLastItem(isOperator = true) {

		let lastItem;

		for(let i = this._operation.length - 1; i >= 0; i--) {

			if(this.isOperator(this._operation[i]) == isOperator) {
				lastItem = this._operation[i];
				break;
			}
		}

		if(!lastItem) {

			lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
		}

		return lastItem;		
	}

	//Check array from finish to beggining to check the last number and update the display
	setLastNumberToDisplay() {

		let lastNumber = this.getLastItem(false);

		//If array is empty add value 0
		if(!lastNumber) lastNumber = 0;

		this.displayCalc = lastNumber;
		
	}

	//Called when user type a digit. Verify the last item of array and the current digit typed
	addOperation(value) {

		//Last item of array is not a number
		if(isNaN(this.getLastOperation())) {
			//String
			if(this.isOperator(value)) {
				//If user typed an operator, update the last item of array instead of push one more item
				this.setLastOperation(value);
			} 
			
			//If the digit typed is a number, push in array (first digit typed by user)
			else {
				this.pushOperation(value);
				this.setLastNumberToDisplay();
			}
		}

		//Last item of array is a number
		else {
			//Current digit typed is a operator
			if(this.isOperator(value)) {
				this.pushOperation(value);
			}
			//Current digit typed is a number
			else {
				//Converts the last item of array to String and concatenate with current digit typed converted to String
				let newValue = this.getLastOperation().toString() + value.toString();
				//Update the last item of array
				this.setLastOperation(newValue);

				this.setLastNumberToDisplay();
			}
		}

		console.log(this._operation);
	}

	setError() {
		this.displayCalc = "Error";
	}

	addDot() {

		let lastOperation = this.getLastOperation();

		if(typeof lastOperation === "string" && lastOperation.split("").indexOf(".") > -1) return;

		if(this.isOperator(lastOperation) || !lastOperation) {
			this.pushOperation("0.");
		} 

		else {
			this.setLastOperation(lastOperation.toString() + ".")
		}

		this.setLastNumberToDisplay();
	}

	execBtn(value) {

		this.playAudio();

		switch(value) {
			case 'ac':
				this.clearAll();
				break;
			case 'ce':
				this.clearEntry();
				break;
			case 'soma':
				this.addOperation("+");
				break;
			case 'subtracao':
				this.addOperation("-");
				break;
			case 'multiplicacao':
				this.addOperation("*");
				break;
			case 'divisao':
				this.addOperation("/");
				break;
			case 'igual':
				this.calc();
				break;
			case 'porcento':
				this.addOperation("%");
				break;
			case 'ponto':
				this.addDot();
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				this.addOperation(parseInt(value));
				break;
			default:
				this.setError();
				break;
		}
	}

	initButtonsEvents() {
		//Get all buttons 
		let buttons = document.querySelectorAll("#buttons > g, parts > g");

		buttons.forEach((btn, index) => {
			this.addEventListenerAll(btn, "click drag", e => {
				
				let textBtn = btn.className.baseVal.replace("btn-", "");
				this.execBtn(textBtn);

			});

			this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
				btn.style.cursor = "pointer";
			});
		});
	}

	//Set date and time values in the Calculator screen
	setDisplayDateTime() {
		this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
			day: "2-digit",
			month: "long",
			year: "numeric"
		});
		this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
	}

	get displayCalc() {
		return this._displayCalcEl.innerHTML;
	}

	set displayCalc(value) {

		if(value.toString().length > 10) {

			this.setError();
			return false;
		}

		this._displayCalcEl.innerHTML = value;
	}

	get currentDate() {
		return new Date();
	}

	set currentDate(value) {
		this._currentDate = value;
	}

	get displayDate() {
		return this._dateEl.innerHTML;
	}

	set displayDate(value) {
		this._dateEl.innerHTML = value;
	}

	get displayTime() {
		return this._timeEl.innerHTML;
	}

	set displayTime(value) {
		this._timeEl.innerHTML = value;
	}
}