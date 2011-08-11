define(function() {
    var pubsub = {},
    publisher = {
        subscribers: {
            any: []
        },
        on: function (type, fn, context) {
            type = type || 'any';
            fn = typeof fn === "function" ? fn : context[fn];

            if (typeof this.subscribers[type] === "undefined") {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push({fn: fn, context: context || this});
        },
        remove: function (type, fn, context) {
            this.visitSubscribers('unsubscribe', type, fn, context);
        },
        fire: function (type, publication) {
            this.visitSubscribers('publish', type, publication);
        },
        visitSubscribers: function (action, type, arg, context) {
            var pubtype = type || 'any',
                    subscribers = this.subscribers[pubtype],
                    i,
                    max = subscribers ? subscribers.length : 0;

            for (i = 0; i < max; i += 1) {
                if (action === 'publish') {
                    subscribers[i].fn.call(subscribers[i].context, arg);
                } else {
                    if (subscribers[i].fn === arg && subscribers[i].context === context) {
                        subscribers.splice(i, 1);
                    }
                }
            }
        }
    };

    function makePublisher(o) {
        var i;
        for (i in publisher) {
            if (publisher.hasOwnProperty(i) && typeof publisher[i] === "function") {
                o[i] = publisher[i];
            }
        }
        o.subscribers = {any: []};
    }

    //enable 'global' custom events with the pubsub object being a publisher,
    //this is similar to (but better performance than) using $(document).bind/trigger
    makePublisher(pubsub);
    /*include makePublisher for cases where you don't want 'global' custom events,
    for example a module could be a publisher and publish its own events
    and anyone that had that module as a dependency could subscribe */
    pubsub.makePublisher = makePublisher;
    return pubsub;
});