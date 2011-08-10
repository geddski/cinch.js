require({
    paths: {
        'cinch': '../cinch',
        'text': "deps/text",
        'jQuery' : "deps/jquery-1.6.2"
    }
});

require(['cinch', 'jQuery', 'deps/qunit'], function(cinch) {
    
    //setup/takedown
    module("cinch.js", {
        setup: function(){

        },
        teardown: function(){
            
        }
    });

    test('tests setup', function(){
      ok(true);
    })
});