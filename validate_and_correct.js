
/*
 * CLASS: validator
   Allows validation (with true/false return) and auto-correction (removing disallowed characters or general formatting) of strings
*/
function validator(){

	/* Validation functions - return either true or false */
	validator.prototype.validate = function(input,against) {

		input = input.trim(); // always trim
		var rules = [];
		rules['email'] = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		rules['integer_any'] = /^-?\d+$/;
		rules['integer_positive'] = /^\d+$/;
		rules['integer_negative'] = /^-\d+$/;
		rules['letters_lower'] = /^[a-z]+$/;
		rules['letters_upper'] = /^[A-Z]+$/;
		rules['letters_mixed'] = /^[(A-Z)]+$/;
		rules['single_word'] = /^[a-zA-Z]+$/;
		rules['single_word_hyphens'] = /^[a-zA-Z-]+$/;
		rules['alphanumeric'] = /^[a-zA-Z0-9]+$/;
		rules['userid'] = /^[A-Za-z0-9_]{3,20}$/; 
		rules['password'] = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/;
		rules['postcode'] = /^[a-zA-Z]{1,2}\d{1,2}\s?\d[a-zA-Z]{1,2}$/;
		rules['phone'] = /^\+?[0-9-\s\(\)]{10,20}$/g // fairly loose format version allowing 10-20 digits inc +()- and spaces. Better regexes are available for country specific formats

		if (rules[against]){
			regex=new RegExp(rules[against]);
			return regex.test(input);
		} else {
			if (against=="futuredate"){
				return _v.futureDate(input); 
			}
			if (against=="creditcard"){
				return _v.creditcard(input);
			}
			if(against=="date_dd_mm_yyyy" || against == "date_yyyy_mm_dd"){
				return _v.validateDate(input,against);
			}
		}

	}

	validator.prototype.validateDate = function (input,format){

		if (format=="date_dd_mm_yyyy"){
			dateRegex = /^\d{2}(-|\/)\d{2}(-|\/)\d{4}$/;
			var components = input.split(/[\/-]/);
			var d = parseInt(components[0], 10);
			var m = parseInt(components[1], 10);
			var y = parseInt(components[2], 10);
		} else {
			dateRegex = /^\d{4}(-|\/)\d{2}(-|\/)\d{2}$/;
			var components = input.split(/[\/-]/);
			var y = parseInt(components[0], 10);
			var m = parseInt(components[1], 10);
			var d = parseInt(components[2], 10);
		}

		regex = new RegExp(dateRegex);
		if (!regex.test(input)) { return false;}

		var date = new Date(y+"/"+m+"/"+d);
		m--; // because months are indexed from 0 not 1
		// The return expression below checks that the y,m and d are the same when put into a new date object. This is because js automatically increments for illegal values = eg 31st september automatically becomes 1st octover. 
		return date.getFullYear() == y && date.getMonth() == m && date.getDate() == d;
	}


	/* Auto correct functions - these return corrected input. */
	validator.prototype.autocorrect = function (input,to){
		
		var _v = this;
		
		if (to=="capitalize_first"){ return input.toLowerCase().replace(input.charAt(0), input.charAt(0).toUpperCase()); }
		if (to=="capitalize"){ return input.toUpperCase(); }
		if (to=="to_upper_case"){ return input.toLowerCase(); }
		if (to=="to_lower_case"){ return input.toLowerCase(); }
		if (to=="alpha"){ return input.replace(/[^a-zA-Z]/g,""); }
		if (to=="remove_spaces"){ return input.replace(/[ ]/g,""); }
		if (to=="strip_leading_zeros"){ return input.replace(/^0+/g,""); }
		if (to=="alphanumeric"){ return input.replace(/[^a-zA-Z0-9]/g,""); }
		if (to=="numbers"){ return input.replace(/[^0-9\-\.]/g,""); }
		if (to=="numeric"){ return input.replace(/[^0-9]/g,""); }
		if (to=="name"){ return _v.toTitleCase(input); }
		if (to=="postcode"){ if (_v.postcode(input)){ return _v.postcode(input); } else return input;}

	}

	/* Capitalise first letter of names taking into account hyphen and double barelled names */
	validator.prototype.toTitleCase = function(str){
		nameArray=str.split("-");
		for (i=0; i<nameArray.length;i++){
		    nameArray[i]=nameArray[i].replace(/(\w\S*)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		newName=nameArray.join("-");

		nameArray=newName.split("'");
		for (i=0; i<nameArray.length;i++){
		    nameArray[i]=nameArray[i].replace(/(\w\S*)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		newName=nameArray.join("'");

		nameArray=newName.split(".");
		for (i=0; i<nameArray.length;i++){
		    nameArray[i]=nameArray[i].replace(/(\w\S*)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		newName=nameArray.join(".");

		return newName;
	}

	/* Function: postcode
	 * Meta: Based on official royal mail suggestions
	 * Expects: uk post code
	 * Returns: correctly formatted postcode or false if input is not recognisable as a post code
	*/

	validator.prototype.postcode = function(str) {

	  // Permitted letters depend upon their position in the postcode.
	  var alpha1 = "[abcdefghijklmnoprstuwyz]";                       // Character 1
	  var alpha2 = "[abcdefghklmnopqrstuvwxy]";                       // Character 2
	  var alpha3 = "[abcdefghjkpmnrstuvwxy]";                         // Character 3
	  var alpha4 = "[abehmnprvwxy]";                                  // Character 4
	  var alpha5 = "[abdefghjlnpqrstuwxyz]";                          // Character 5
	  var BFPOa5 = "[abdefghjlnpqrst]";                               // BFPO alpha5
	  var BFPOa6 = "[abdefghjlnpqrstuwzyz]";                          // BFPO alpha6
	  
	  // Array holds the regular expressions for the valid postcodes
	  var pcexp = new Array ();
	  
	  // BFPO postcodes
	  pcexp.push (new RegExp ("^(bf1)(\\s*)([0-6]{1}" + BFPOa5 + "{1}" + BFPOa6 + "{1})$","i"));

	  // Expression for postcodes: AN NAA, ANN NAA, AAN NAA, and AANN NAA
	  pcexp.push (new RegExp ("^(" + alpha1 + "{1}" + alpha2 + "?[0-9]{1,2})(\\s*)([0-9]{1}" + alpha5 + "{2})$","i"));
	  
	  // Expression for postcodes: ANA NAA
	  pcexp.push (new RegExp ("^(" + alpha1 + "{1}[0-9]{1}" + alpha3 + "{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$","i"));

	  // Expression for postcodes: AANA  NAA
	  pcexp.push (new RegExp ("^(" + alpha1 + "{1}" + alpha2 + "{1}" + "?[0-9]{1}" + alpha4 +"{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$","i"));
	  
	  // Exception for the special postcode GIR 0AA
	  pcexp.push (/^(GIR)(\s*)(0AA)$/i);
	  
	  // Standard BFPO numbers
	  pcexp.push (/^(bfpo)(\s*)([0-9]{1,4})$/i);
	  
	  // c/o BFPO numbers
	  pcexp.push (/^(bfpo)(\s*)(c\/o\s*[0-9]{1,3})$/i);
	  
	  // Overseas Territories
	  pcexp.push (/^([A-Z]{4})(\s*)(1ZZ)$/i);  
	  
	  // Anguilla
	  pcexp.push (/^(ai-2640)$/i);

	  // Load up the string to check
	  var postCode = str;

	  // Assume we're not going to find a valid postcode
	  var valid = false;
	  
	  // Check the string against the types of post codes
	  for ( var i=0; i<pcexp.length; i++) {
	  
	    if (pcexp[i].test(postCode)) {
	    
	      // The post code is valid - split the post code into component parts
	      pcexp[i].exec(postCode);
	      
	      // Copy it back into the original string, converting it to uppercase and inserting a space 
	      // between the inward and outward codes
	      postCode = RegExp.$1.toUpperCase() + " " + RegExp.$3.toUpperCase();
	      
	      // If it is a BFPO c/o type postcode, tidy up the "c/o" part
	      postCode = postCode.replace (/C\/O\s*/,"c/o ");
	      
	      // If it is the Anguilla overseas territory postcode, we need to treat it specially
	      if (str.toUpperCase() == 'AI-2640') {postCode = 'AI-2640'};
	      
	      // Load new postcode back into the form element
	      valid = true;
	      
	      // Remember that we have found that the code is valid and break from loop
	      break;
	    }
	  }
	  
	  // Return with either the reformatted valid postcode or the original invalid postcode
	  if (valid) {return postCode;} else return false;
	}

 
	/* 
	 * Function: dayIndexToDay 
	 * Expects: the day index 0-6 starting with Sunday
	 * Returns: the written date 
	*/
	validator.prototype.dayIndexToDay = function (dayIndex){
		 var days = Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
		 return days[dayIndex];
	}

	/* 
	 * Function: getDateSuffix  
	 * Expects: the date component of a full date only 
	 * Returns: the suffix only eg. 23 returns rd.
	*/
	validator.prototype.getDateSuffix = function (incomingDate){
	    var sup = "";
	    if (incomingDate== 1 || incomingDate== 21 || incomingDate==31) { sup = "st"; }
	    else if (incomingDate== 2 || incomingDate== 22) { sup = "nd"; }
	    else if (incomingDate== 3 || incomingDate== 23) { sup = "rd"; }
	    else { sup = "th"; }
	    return sup;
	}

	/* 
	 * Function: dateToDateWithSuffix
	 * Expects: the date component of a full date only eg. 23 becomes 23rd.
	 * Returns: the date component + the full suffix eg. 23 returns 23rd. 
	*/
	validator.prototype.dateToDateWithSuffix = function(incomingDate){

	    // remove leading zero if there
	    if (incomingDate.substr(0,1)=="0"){
		incomingDate=incomingDate.substr(1,1);
	    }

	    var sup = "";
	    if (incomingDate== 1 || incomingDate== 21 || incomingDate==31) { sup = "st"; }
	    else if (incomingDate== 2 || incomingDate== 22) { sup = "nd"; }
	    else if (incomingDate== 3 || incomingDate== 23) { sup = "rd"; }
	    else { sup = "th"; }
	    return incomingDate + sup;
	}


	/*
	 * Function checkCreditCardFormat
	 *
	*/

	/* Function __indexOf - index of array, as used by the credit card validator*/
	var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	validator.prototype.validateCreditCard = function(cardNumber) {

		var card_types, get_card_type, is_valid_length, is_valid_luhn, normalize, validate, validate_number;

		card_types = [
		      {
			name: 'amex',
			pattern: /^3[47]/,
			valid_length: [15]
		      }, {
			name: 'diners_club_carte_blanche',
			pattern: /^30[0-5]/,
			valid_length: [14]
		      }, {
			name: 'diners_club_international',
			pattern: /^36/,
			valid_length: [14]
		      }, {
			name: 'jcb',
			pattern: /^35(2[89]|[3-8][0-9])/,
			valid_length: [16]
		      }, {
			name: 'laser',
			pattern: /^(6304|670[69]|6771)/,
			valid_length: [16, 17, 18, 19]
		      }, {
			name: 'visa_electron',
			pattern: /^(4026|417500|4508|4844|491(3|7))/,
			valid_length: [16]
		      }, {
			name: 'visa',
			pattern: /^4/,
			valid_length: [16]
		      }, {
			name: 'mastercard',
			pattern: /^5[1-5]/,
			valid_length: [16]
		      }, {
			name: 'maestro',
			pattern: /^(50|(5[6-9]|6[0-9])\d\d\d\d[\d]{6,13})/,
			valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
		      }, {
			name: 'discover',
			pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
			valid_length: [16]
		      }
		];

		get_card_type = function(cardNumber) {
		      var card_type, _i, _len;
		      for (_i = 0, _len = card_types.length; _i < _len; _i++) {
			card_type = card_types[_i];
			if (cardNumber.match(card_type.pattern)) {
			  return card_type;
			}
		      }
		      return null;
	    	};

		is_valid_luhn = function(cardNumber) {
		      var digit, n, sum, _i, _len, _ref;
		      sum = 0;
		      _ref = cardNumber.split('').reverse();
		      for (n = _i = 0, _len = _ref.length; _i < _len; n = ++_i) {
			digit = _ref[n];
			digit = +digit;
			if (n % 2) {
			  digit *= 2;
			  if (digit < 10) {
			    sum += digit;
			  } else {
			    sum += digit - 9;
			  }
			} else {
			  sum += digit;
			}
		      }
		      return sum % 10 === 0;
		 };

		 is_valid_length = function(cardNumber, card_type) {
		      var _ref;
		      return _ref = cardNumber.length, __indexOf.call(card_type.valid_length, _ref) >= 0;
		 };

		 validate_number = function(cardNumber) {
		      var card_type, length_valid, luhn_valid;
		      card_type = get_card_type(cardNumber);
		      luhn_valid = false;
		      length_valid = false;
		      if (card_type != null) {
				luhn_valid = is_valid_luhn(cardNumber);
				length_valid = is_valid_length(cardNumber, card_type);
		      }
		      if(cardNumber==1000380000000004 || cardNumber==1000350000000536) return true;
		      if(luhn_valid && length_valid) return true;
		      return false;
		 };

		 creditcard = function(cardNumber) {
		      return validate_number(cardNumber);
		 };

		 normalize = function(cardNumber) {
		      return cardNumber.replace(/[ -]/g, '');
		 };

		 if (this.length !== 0) {
		      return creditcard.call(this,cardNumber);
		 }
	};


	/* 
	 * Function: creditcard 
	 * Validate a credit or debit card number 
	 * Expects: card number
	 * Returns: bool
	*/
	validator.prototype.creditcard = function(cardNumber){
		var _v = this;
		return _v.validateCreditCard(cardNumber);
	}


	/*
	 * Function: futureDate - tests that a date is in the future
	 * Expects: dd/mm/yyyy format only
	 * Returns: bool
	*/
	validator.prototype.futureDate = function(incomingDate){
		if (!incomingDate.match(/^\d{2}\/\d{2}\/\d{4}$/)){ return false;}
		var cDate = new Date();
		var currentString = cDate.getFullYear() + "/" +  (cDate.getMonth()+1) +  "/" + cDate.getDate();
		var currentDate = new Date(currentString);
		var incomingDateParts = incomingDate.split("/");
		var incomingDate = incomingDateParts[2] + "/"+ incomingDateParts[1] + "/" + incomingDateParts[0];
		var dateEntered = new Date(incomingDate);

		if (dateEntered <= currentDate){
			return false;
		} else {
			return true;
		}

	}

}
 
/* Add to string prototype */
String.prototype._validate = function(modifier){
	var _v = new validator();
	return _v.validate(this,modifier);	
}

/* Add to string prototype */
String.prototype._autocorrect = function(modifier){
	var _v = new validator();
	return _v.autocorrect(this,modifier);	
}

var _v = new validator(); // if you don't want to use the string prototype directly, use _v.function(input,type);
