window._custom = {
    'getCompanyId': function () {
        return '5632185f7aa488f97544befb'; // local
        //return '5649ec757aa488b751a609c8'; // Wax and Go
    },
    'getAppName' : function(){
        return 'Wax and Go distribution';
    },
    'useSocialLogin': function () {
        return false;
    },
    'getCustomBookController': function () {
        return false;
        //return 'request.html';
    },
    'getCustomControllerMap': function () {
        return {
            'registration.html' : 'custom/registration.html',
            'delivery-shipping.html' : 'custom/delivery-shipping.html',
        };
    },
    'allowSkipOnWelcome' : function(){
        return false;
    },
    
    /**
     * en
     * ru
     * et
     * 
     * false — initiate lang dialog
     * @returns {String}
     */
    'getFixedLang': function () {
        //return false;
        return 'ru';
    },
    'getWelcomScreenSlides': function () {
        return [
            {
                id: 'slide0',
                image: 'custom/banner1.jpg',
                text: ''
            },
            {
                id: 'slide1',
                image: 'custom/banner2.jpg',
                text: '<div class="welcome-text"><div><i class="loya-icon sprite-img">B</i></div>{{lang "bootstrap-7"}}</div>'
            },
            {
                id: 'slide2',
                image: 'custom/banner3.jpg',
                text: '<div class="welcome-text"><div><i class="loya-icon sprite-img">B</i></div>{{lang "bootstrap-8"}}</div>'
            },
            {
                id: 'slide3',
                image: 'custom/banner4.jpg',
                text: '<div class="welcome-text"><div><i class="loya-icon sprite-img">B</i></div>{{lang "bootstrap-9"}}</div>'
            },
            {
                id: 'slide4',
                image: 'custom/banner5.jpg',
                text: '<div class="welcome-text"><div><i class="loya-icon sprite-img">B</i></div>{{lang "bootstrap-10"}}</div>'
            },            
        ];
    }
};
