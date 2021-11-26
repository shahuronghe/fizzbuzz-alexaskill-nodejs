/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
let current = 0;
let lastWord = '';
let loseStr = 'I’m sorry, the correct response was '; 
let loseStrEnd = 'You lose! Thanks for playing Fizz Buzz. For another great Alexa game, check out Song Quiz! Do you want to play fizz buzz again?';
const keywords = {
    FIZZ : "fizz",
    BUZZ : "buzz",
    FIZZBUZZ : "fizz buzz"
}

// HELPER FUNCTIONS //
function getSlotValues(slots){
    const slotValues = {};
    
    Object.keys(slots).forEach((item) => { 
        const name  = slots[item].name;
        slotValues[name] = {value: slots[item].value};
    }, this); 
 
    return slotValues; 
}

function getFizzBuzz(num){
    if(num % 3 === 0 && num % 5 === 0){
        return keywords.FIZZBUZZ;
    } else if(num % 5 === 0){
        return keywords.BUZZ;
    } else if(num % 3 === 0){
        return keywords.FIZZ;
    } 
    return num;
}

function buildIncorrectResponseString(num){
    let correctRes = getFizzBuzz(current);
    current = 0;
    return loseStr + ' "' + correctRes + '". ' + loseStrEnd;
}


// INTENTS //
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        var speakOutput = 'Welcome to Fizz Buzz. We\'ll each take turns counting up from one. '+
        'However, you must replace numbers divisible by 3 with the word “fizz” and you must replace numbers divisible by 5 with the word “buzz”. '+
        'If a number is divisible by both 3 and 5, you should instead say “fizz buzz”. If you get one wrong, you lose.';
        
        speakOutput += ' OK, I’ll start... One.';
        current = 1;
        lastWord = speakOutput;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



//User input intent for getting next number with FizzBuzz String//
const UserInputNumberHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'UserInputNumber' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = '';
        
        if(current === 0){
            speakOutput = "The game is already being ended. Do you want to play again?"
            return responseBuilder
            .speak(speakOutput)
            .reprompt('try again, ' + speakOutput)
            .getResponse();
        }
        
        let slotValues = getSlotValues(request.intent.slots); 
        
        //numberic response
        if(slotValues && slotValues.usrNumber.value){
            let num = slotValues.usrNumber.value;
            let res = getFizzBuzz(num);
            if(num > current && (num - current) === 1 && !isNaN(res)){
                current++;
                speakOutput = getFizzBuzz(++current).toString();
            } else{
                speakOutput = buildIncorrectResponseString(++current);
            }
        }
        
        //word response
        if(slotValues && slotValues.fb.value){
            let word = slotValues.fb.value;
            let res = getFizzBuzz(++current);
            if(word === res){
                speakOutput = getFizzBuzz(++current).toString();
            } else {
                speakOutput = buildIncorrectResponseString(current);
            }
        }
        lastWord = speakOutput;
        return responseBuilder
            .speak(speakOutput)
            .reprompt('try again, ' + speakOutput)
            .getResponse();
    },
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        let speakOutput = '';
        if(current===0){
            current = 1;
            speakOutput += ' OK, let\'s start it again.  I\'ll start... One.';
        } else {
            speakOutput += 'I don\'t know what to do with that. Please continue the game';
        }
        lastWord = speakOutput;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        const speakOutput = lastWord;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        UserInputNumberHandler,
        YesIntentHandler,
        RepeatIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();