"use strict";

function decodeBarcodeFromAreas(areas)
{
    let result = {
        barcode: "123456", 
        message: "No middle guard", 
        checksumValid: false
    };
	
	/* areasLeft = a substring (3 characters) containing the supposed left guard of the areas string of 0 and 1
     * areasMiddle = similar to areasLeft but instead of left guard it's the middle guard and it's a substring of 5 characters instead of 3
     * areasRight = similar to areasLeft but for the right guard
     * allGuards = array containing the strings extracted and stored in areasLeft, areasMiddle, areasRight
     * varFromDict, correctGuards, the7CharStr, leftAreaOnes, rightAreaOnes, checkingParity
       = variables used to store the corresponding outputs to the function being called in their respective lines
    */

    let areasLeft=areas.substr(0,3);
	
    let areasMiddle=areas.substr(45,5);
	
    let areasRight=areas.substr(92,3);
	
    let allGuards=[areasLeft,areasMiddle,areasRight];
	
	let varFromDict=getDictionary();
	
    let correctGuards=checkGuards(allGuards,varFromDict[3],varFromDict[4]);
	
    let the7CharStr=get7CharStr(areas);
	
    let leftAreaOnes=getNumOfOnesLeft(the7CharStr);
	
    let rightAreaOnes=getNumOfOnesRight(the7CharStr);
	
    let checkingParity=checkParityAndBackwards(leftAreaOnes,rightAreaOnes);
    
    // the barcode will be reversed using the reverseBarcode function when it is found to be upside down
    if (checkingParity==="barcode is reversed")
    {
        the7CharStr = reverseBarcode(areas);
    }
 
    /* if the guards and the parity of the barcode are valid and correct, the code will proceed to extract the digits from 0 to 9 according to the        patterns of 0 and 1 as stored in varFromDict 
     * digitsAndParityPatterns is used to store the output given by the get12DigitsAndParityPattern function after calling it. The output is an array     consisting of 2 elements first being the 12 digits of the barcode and the second being the 6-characters long string of parity pattern consisting   of L and G
     * completeParityPattern only stores the 2nd element in digitsAndParityPattern 
     * parityDigit is first used to store the parity digit found by calling the findParityDigit function. It is then concantenated with the 1st element   of digitsAndParityPattern to form the full 13-character long barcode
     * completeBarcodeDigits is used to store each of the 13 digits from the barcode as individual elements in an array to calculate their checksum.
     */
    let digitsAndParityPattern = get12DigitsAndParityPattern(the7CharStr,varFromDict[0],varFromDict[1],varFromDict[2]);
	
    let completeParityPattern = digitsAndParityPattern[1];
	
    let parityDigit = findParityDigit(completeParityPattern,varFromDict[5]);
	
    parityDigit += digitsAndParityPattern[0];
	
    let completeBarcodeDigits=parityDigit.split(""); 
	
	let fullBarcode = parityDigit;
	
	// update the barcode property in result with the complete barcode
    result.barcode=fullBarcode;
	
    // the following for loop is used to convert all of the 13 characters in the barcode into number as all of the characters are originally in string format
    
    for (let z=0 ;z<13;z+=1)
    {
	   completeBarcodeDigits[z]=Number(completeBarcodeDigits[z]);
    }
    
    // getChecksum is used store the output given by the checkSum function
    let getChecksum=checkSum(completeBarcodeDigits);
    
    // the checksumValid property will be updated to true if getChecksum is gives "Checksum valid" output
    if (getChecksum==="Checksum valid")
    {
        result.checksumValid=true;
    }
    
    //the following section helps to display all of the different messages after the checking through all of the features.
   
    if ((fullBarcode.length ===13) && (checkingParity === "barcode is reversed"))
    {
        result.message = "Scanning is complete and <br/> barcode is upside down.";
    }
    
    else if ((fullBarcode.length === 13) && (getChecksum !== "Checksum valid"))
    {
        result.message = "Scanning is complete but <br/> checksum is not valid.";
    }
    
     else if (fullBarcode.length === 13)
    {
        result.message = "Scanning is complete.";
    }
    
    else if (correctGuards==="error1")
    {
        result.message="Invalid left guard";
    }
    
    else if (correctGuards==="error2")
    {
        result.message="Invalid right guard";
    }
    
    else if (correctGuards==="error3")
    {
        result.message= "Invalid middle guard";
    }
    
    else if (checkingParity==="invalid parity")
    {
        result.message="The barcode's parity is not correct";
    }
    
    return result;
}

//-----------------------------------------------------------FEATURE 1----------------------------------------------------------------------------//

/* getDictionary is used as a dictionary to store all of the given datas and output the datas needed when called*/
function getDictionary()
{
    // the value of the digits correspond to the index of the elements in the following 3 arrays
	let leftOdd = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];

	let leftEven = ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"];

	let right = ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];

	let rightLeftGuard = "101";

	let middleGuard = "01010";

// the value of parity digit also corresponds to the index of the elements in the parityPattern array
	let parityPattern = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG ","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];
    
	let dictionary = [leftOdd,leftEven,right,rightLeftGuard,middleGuard,parityPattern];
    
	return dictionary;
}

//-----------------------------------------------------------FEATURE 2------------------------------------------------------------------------//
/* checkGuards is used to check if the supposed left, right and middle guard are in the correct format
 * function input : 1) guardsArray - an array containing all the supposed guards of the barcode
                  : 2) rightLeftGuard - the correct format where the arrangement of the right and left guard's 0 and 1 should be
                  : 3) middleGuard - the correct format where the arrangement of the middle guard's 0 and 1 should be
 */
function checkGuards(guardsArray,rightLeftGuard,middleGuard)
{
    if (guardsArray[0] !== rightLeftGuard) 
    {
        return "error1";
    }
    
    else if (guardsArray[2] !== rightLeftGuard)
    {
        return "error2";
    }
    
    else if (guardsArray[1] !== middleGuard)
    {
        return "error3";
    }
    
    else
    {
        return true;
    }
    
}

/* get7CharStr function is used to get each of the 7-character long string corresponding to 1 digit in the barcode and store them in an array
 * function input: allBarcodeData - the 95-character long string to 0 and 1 
 */
function get7CharStr(allBarcodeData)
{
    let all12DigitsArray = [0,0,0,0,0,0,0,0,0,0,0,0];
	
    let i = 0;
	
    for (let num = 3; num <= 44; num += 7)                 
    {
        let aDigit = allBarcodeData.substr(num,7);
		
        all12DigitsArray[i] = aDigit;
		
        i += 1;
    }
	
    for (let num = 50; num <= 91; num += 7 )
    {
        let aDigit = allBarcodeData.substr(num,7);
		
        all12DigitsArray[i] = aDigit;
		
        i += 1;
    }
    return all12DigitsArray;
}


//--------------------------------------------------------- FEATURE 3-----------------------------------------------------------------------//
/* getNumOfOnesLeft finds the sum of ones in each of the 7-character long string of 0 and 1 in the left area
 * function input : the12DigitsArray - the array containing all 12 strings of 7-character long 0 and 1
 */
function getNumOfOnesLeft(the12DigitsDataArray)
{
    let leftAreaSumOfOnes = [0,0,0,0,0,0];
    
    for (let i = 0 ; i <= 5 ; i += 1)
    {
        let sumOfOnes = 0;
		
        for (let j = 0 ; j<7 ; j += 1)
        {
            let swapStringToNum = Number(the12DigitsDataArray[i][j]);
			
            sumOfOnes += swapStringToNum;
        }
        
        leftAreaSumOfOnes[i] = sumOfOnes;
        
    } 
    return leftAreaSumOfOnes;
}

/* getNumOfOnesRight does the same thing as getNumOfOnesLeft but for the right area */
function getNumOfOnesRight(the12DigitsDataArray)
{
    let rightAreaSumOfOnes = [0,0,0,0,0,0];
	
    for (let i = 6 ; i < 12 ; i += 1)
    {
        let sumOfOnes = 0;
		
        for (let j = 0 ; j < 7 ; j += 1)
        {
            let swapStringToNum = Number(the12DigitsDataArray[i][j]);
			
            sumOfOnes += swapStringToNum;
        }
        
        rightAreaSumOfOnes[i-6] = sumOfOnes;
        
    } 
    return rightAreaSumOfOnes;
}

/* checkParityAndBAckwards checks for the parity on both the right and left area and detects if the barcode is upside down or not
 * function input : 1) sumOfOnesLeft - the sum of ones for each of the 7-character long string in the left area
                  : 2) sumOfOnesRight - similar to areaLeft but for the right area
 */
function checkParityAndBackwards(sumOfOnesLeft,sumOfOnesRight)
{
    let isBackwards = false;
	
    let evenParityRight = 0;
	
    let evenParityLeft = 1;
	
    let notice = "";
	
    if ((sumOfOnesLeft[0] % 2 ) !== 0)  			
    {
        for (let aIndex = 0 ; aIndex < 6 ; aIndex += 1) 
        {
            if ((sumOfOnesRight[aIndex] % 2) === 0) 
            {
            
                evenParityRight += 1; 				
			
            }
        }
    }

    else
    {	
        for (let aIndex = 1 ; aIndex < 6 ; aIndex += 1)
        {
            if ((sumOfOnesLeft[aIndex] % 2) === 0)
            {
                evenParityLeft += 1;
            }
        }
        if ((sumOfOnesRight[5] % 2)!== 0)
        {
            isBackwards = true;
        }
    }

    if (evenParityRight === sumOfOnesRight.length)
    {
	   notice += "no error";
    }
    else if ((evenParityLeft === sumOfOnesLeft.length) && (isBackwards === true))
    { 
	   notice += "barcode is reversed"; // reverse barcode
    }

    else 
    {
	   notice += "invalid parity";
    }
    
    return notice;
}

/* reverseBarcode function will only be called when the barcode is found to be upside down
 *function input : allBarcodeData - the 95-character long string of 0 and 1
 */
function reverseBarcode(allBarcodeData)
{

	let barcodeReversing = "";
	
	for (let i = (allBarcodeData.length)-1 ; i >= 0 ; i -= 1)
	{
		barcodeReversing += allBarcodeData[i];
	}
    
	let reversedBarcodeDataInArray = get7CharStr(barcodeReversing); //calling the get7CharStr to get an array containing all of the 7-characters string of 0 and 1
	
	return reversedBarcodeDataInArray;
}

/* get12DigitsAndParityPattern function checks through the dictionary to find matching digits to the corresponding 7-character long strings of 0 and 1    along with the parity pattern in the left area
 * function inputs : 1) the12DigitsDataArray - the array containing 12 of the 7-characters strings of 0 and 1 
                   : 2) leftDigitsOdd - one of the arrays in the dictionary containing the pattern of the 0 and 1 of each of the odd digits in the left                      area
                   : 3) leftDigitsEven - another array in the dictionary containing the pattern of the 0 and 1 of each of the even digits in the left                        area
                   : 4) rightDigits - yet another array in the dictionary containing the pattern of the 0 and 1 of each of the digits in the right area
 */
function get12DigitsAndParityPattern(the12DigitsDataArray,leftDigitsOdd,leftDigitsEven,rightDigits)
{
    let numStr = "";
	
    let leftParityPattern = "";
	
    let digitsAndParityPattern = [0,0];
	
    {
        
        for (let j = 0 ; j < 6 ; j += 1)
        {
            for (let i = 0 ; i < 10 ; i += 1)
            {
                if (the12DigitsDataArray[j] === leftDigitsOdd[i]) 
                {
                    numStr += i;
					
                    leftParityPattern += "L";
                    
                }
                else if (the12DigitsDataArray[j] === leftDigitsEven[i])
                {
                    numStr += i;
					
                    leftParityPattern += "G";
                }    
                
                
            }
        }
        for (let m = 6 ; m < 12 ; m += 1)
        {
            for (let k = 0 ; k < 10 ; k += 1)
            {
                if (the12DigitsDataArray[m] === rightDigits[k])
                {
                    numStr += k;
                }
            }
        }
    }
    
    digitsAndParityPattern[0] = numStr;
	
    digitsAndParityPattern[1] = leftParityPattern;
	
    return digitsAndParityPattern;
}

//---------------------------------------------------------------FEATURE 4-------------------------------------------------------------------//
/* findParityDigit function is used to find the parity digit of the barcode
 * function inputs : 1) theParityPattern - the parity pattern consisting of L and/or G obtained from getAll12Nums function
                   : 2) parityPatternFromDictionary - an array in the dictionary with each of the parity digits and their corresponding parity                                            pattern listed
 */
function findParityDigit(theParityPattern,parityPatternFromDictionary)
{
    let realParityDigit = "";
	
    for (let a = 0 ; a < 10 ; a += 1)
    {
        if (theParityPattern === parityPatternFromDictionary[a])
        {
            realParityDigit += a;
        }
    }
    return realParityDigit;
}

//----------------------------------------------------------------FEATURE 5------------------------------------------------------------------//
/* checkSum function is used to find the checksum of the barcode in order to determine the validity of the barcode
 * function input : barcode - a string of all of the 13 digits of the barcode 
 */
function checkSum(barcode)
{
    let product = 0;  //Product of position and multiplier
    
    let nearestMultipleOfTen = 0;
    
    let check = 0;
    
    let message = "";
    
    for (let i =(barcode.length)-2; i >= 0; i--)
    {
        if ((i % 2) === 0)
        {
            product += barcode[i] * 1;
        }
        else if ((i % 2) === 1)
        {
            product += barcode[i] * 3;
        }
    }
	
    let sum =  product;
    
    nearestMultipleOfTen += (Math.ceil(product / 10)) * 10;
    
    check += nearestMultipleOfTen - sum;
    
    if (check !== barcode[12])
    {
        message += "invalid checksum";
    }
    else
    {
        message += "Checksum valid";
    }
    
    return message;
}


