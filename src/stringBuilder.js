(function(box){

	var slice = Array.prototype.slice,
		
		emptyFunction = function() {},

		functionK = function(k) { return function() { return k; } },

	    StringBuilder = function () {
	        this.buffer = [];
	    },

	    isArray = function(value){
    		return Object.prototype.toString.apply(value) === '[object Array]';
	    },

	    isFunction = function(value){
	    	return typeof value == 'function';
	    };

    StringBuilder.prototype = {
    	__prefix: [],
    	__suffix: [],
    	__sb: null,

    	//arg0, arg1, arg2, ..., argN
        cat: function () {
        	var i, 
        		args = this.__prefix.concat(slice.apply(arguments).concat(this.__suffix)), 
        		len = args.length,
        		value;

        	for(i = 0; i < len; i+= 1) {
        		value = args[i];
        		
        		if (typeof value == 'undefined') continue;

        		if (isFunction(value)){
        			value = value.call(this);
        			this.cat.call({buffer: this.buffer, __suffix:[], __prefix: [], __sb: this}, value);
        			continue;
        		}
        		else if (isArray(value)){
        			this.cat.apply({buffer: this.buffer, __suffix:[], __prefix: [], __sb: this}, value);
        			continue;
        		}

            	this.buffer.push(value);        		
        	}

            return this;
        },

        //rep(arg0, arg1, arg2... , argN, howManyTimes)
        rep: function () {
        	var len = arguments.length,
        		args = slice.call(arguments, 0, len - 1),
        		howManyTimes = arguments[len - 1];

            for (var i = 0; i < howManyTimes; i += 1) {
                this.cat.apply(this, args);
        	}

            return this;
        },

        catIf: function () {
            var args = arguments,
            	len = arguments.length - 1,
        		test = arguments[len];

        	if (isFunction(test)){
        		test = test.call(this);
        	}            

            if (test) {
            	args = slice.call(arguments, 0, len);
            	this.cat.apply(this, args);
        	}

            return this;
        },

        string: function () {
            return this.buffer.join('');
        },

        wrap: function(prefix, suffix){
        	var result = new StringBuilder();
        	prefix = prefix || [];
        	suffix = suffix || [];
        	result.buffer = this.buffer;
        	result.__prefix = this.__prefix.concat(isArray(prefix) ? prefix : [prefix]);
        	result.__suffix = (isArray(suffix) ? suffix : [suffix]).concat(this.__suffix);
        	result.__sb = this;

        	return result;
        },

        prefix: function(){
        	return this.wrap(slice.apply(arguments), []);
        },

        suffix: function(){
        	return this.wrap([], slice.apply(arguments));
        },

        end: function(deep){
        	if (typeof deep === 'number' && typeof this.__sb !== 'undefined' && deep > 1){
        		return this.__sb.end(deep - 1);
        	}

        	return this.__sb || this; //TODO: decide if return null instead of this when making misscalls
        },

        suspend: function(){
        	var result = new StringBuilder();

        	result.buffer = this.buffer;
        	result.__sb = this;

        	return result;        	
        },

        //each([arg1, arg2], function(value, i){})
        each: function(){
        	var args = isArray(arguments[0]) ? arguments[0] : [arguments],
        		callback = isFunction(arguments[1]) ? arguments[1] : functionK(arguments[1]),
        		len = args.length,
        		i,
        		result;

        	for(i = 0; i < len; i += 1){
        		result = callback.call(this, args[i], i);
        		if (typeof result !== 'undefined'){
        			this.cat(result);
        		}
        	}

        	return this;
        },

        //when(test, thenArgs, otherwiseArgs)
        when: function() {
        	var test = arguments[0],
        		thenArgs = arguments[1],
        		otherwiseArgs = arguments[2];

        	if (isFunction(test)){
        		test = test.call(this);
        	}

        	this.cat(test ? thenArgs : otherwiseArgs)
        }
    };

    box.StringBuilder = StringBuilder;

})(this);