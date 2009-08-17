// Used to detect IE6
Prototype.Browser.IE6 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 6;

// New framework for dispatching in class events (should probably be in it's own project)
var EventDispatcher = Class.create({
    initialize: function() {
        this.tagsWithFuncs = {};
    },

    // Attach and event to the specified tag
    attachCallbackToEvent: function(tag, func) {
        var funcs = this.tagsWithFuncs[tag];
        
        if (funcs == null) {
           funcs = [];
           this.tagsWithFuncs[tag] = funcs;
        }

        funcs.push(func);
    },

    // Call the events that have been attached to the specified tag
    callEventsWithTag: function(tag, object) {
        var funcs = this.tagsWithFuncs[tag];
        
        if (funcs != null) {
            funcs.each(function(func) {
                func(object);
            });
        }
    }
});

var Equalizer = Class.create(EventDispatcher, {
    options: {
        "equalizeWidth": true,          // Set true to equalize width
        "equalizeHeight": true          // Set true to equalize height
    },
    
    initialize: function($super, selector, options) {
        $super();
        
        this.options = Object.extend(Object.extend({ }, this.options), options || { });        
        this.elements = $$(selector);
    },
    
    setDimension: function(element, dimension) {
        var actualCSSDimension = {
            "width": dimension.width -
                (parseInt(element.getStyle('paddingLeft')) + parseInt(element.getStyle('paddingRight'))) -
                (parseInt(element.getStyle('borderLeftWidth')) + parseInt(element.getStyle('borderRightWidth'))),
            "height": dimension.height -
                (parseInt(element.getStyle('paddingTop')) + parseInt(element.getStyle('paddingBottom'))) -
                (parseInt(element.getStyle('borderTopWidth')) + parseInt(element.getStyle('borderBottomWidth')))
        };
        
        // Set the width of the element without the paddings
        if (this.options.equalizeWidth) {
            element.setStyle({ "width": actualCSSDimension.width + "px" });
        }
        
        if (this.options.equalizeHeight && Prototype.Browser.IE6) {
           element.setStyle({ "height": actualCSSDimension.height + "px" });
        }
        else if (this.options.equalizeHeight) {
           element.setStyle({ "minHeight": actualCSSDimension.height + "px" });
        }
    },
    
    update: function() {
        var biggestWidthElement = null;
        var biggestHeightElement = null;
        
        // Search for biggest elements
        this.elements.each(function(element) {
            // Initial element is biggest at start
            if (biggestWidthElement == null) biggestWidthElement = element;
            if (biggestHeightElement == null) biggestHeightElement = element;
            
            // Check to see if current element is bigger in width
            // If so, store it as the biggest width element
            if (element.getWidth() > biggestWidthElement.getWidth()) {
                biggestWidthElement = element;
            }
            
            // Check to see if current element is bigger in height     
            // If so, store it as the biggest height element    
            if (element.getHeight() > biggestHeightElement.getHeight()) {
                biggestHeightElement = element;
            }
        });
        
        // Calculate the target size
        var targetDimension = {
            "width": biggestWidthElement.getWidth(),
            "height": biggestHeightElement.getHeight()
        };
        
        // Equalize the sizes
        this.elements.each(function(element) {
            this.setDimension(element, targetDimension);
        }.bind(this));
        
        // Call the events attached to the Equalizer.Events.Update
        this.callEventsWithTag(Equalizer.Events.Update, this);
    }
});

// The tags used for the EventDispatcher
Equalizer.Events = {
  "Update": "Equalizer.Events.Update"
};