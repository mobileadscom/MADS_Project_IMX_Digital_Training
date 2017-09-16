/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function(options) {

  var _this = this;

  this.render = options.render;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];



  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined' ? rma.customize.src : '';

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = 'settings.json';
  }

  /* load json for assets */
  var reqJSON = new XMLHttpRequest();
  if (Object.keys(this.json).length === 0 && this.json.constructor === Object) this.json = 'settings.json'
  reqJSON.open('GET', this.path + this.json, true);

  reqJSON.onload = function() {
    if (reqJSON.status >= 200 && reqJSON.status < 400) {
      // Success!
      _this.data = JSON.parse(reqJSON.responseText);
      _this.render.render();
    } else { /* Error! */ }
  };
  reqJSON.onerror = function() {
    // There was a connection error of some sort
  };
  reqJSON.send();

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

// Load Image
mads.prototype.loadImage = function(filename, ext) {
  if (!/(png|jpg|jpeg)/.test(filename)) {
    filename = filename + (ext ? '.' + ext : '.png')
  }
  var imageUrl = filename.indexOf('http') > -1 ? filename : this.path + 'img/' + filename;
  var css = '.preload-image-' + this.uniqId() + ' { background: url(' + imageUrl + ') no-repeat -9999px -9999px; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);

  return imageUrl;
}

mads.prototype.addStyle = function(css) {
  var head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

/* Generate unique ID */
mads.prototype.uniqId = function() {
  return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

  var tagsStr = '';

  for (var obj in tags) {
    if (tags.hasOwnProperty(obj)) {
      tagsStr += '&' + obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

  if (typeof url != "undefined" && url != "") {

    if (typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    } else {
      window.open(url);
    }

    if (typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

  /*
   * name is used to make sure that particular tracker is tracked for only once
   * there might have the same type in different location, so it will need the name to differentiate them
   */
  name = name || type;

  if (tt == 'E' && !this.fetTracked) {
    for (var i = 0; i < this.fet.length; i++) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
    for (var i = 0; i < this.custTracker.length; i++) {
      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function(url) {
  for (var i = 0; i < url.length; i++) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

/*
 *
 * Unit Testing for mads
 *
 */
var Adunit = function() {

  /* pass in object for render callback */
  this.app = new mads({
    'render': this
  });
}

/*
 * render function
 * - render has to be done in render function
 * - render will be called once json data loaded
 */
Adunit.prototype.render = function() {
  var _self = this;
  var data = this.app.data;

  var adId = data.adVersion;
  var content = '<div class="adcontainer"><div class="screen1 screens"><img id="daftar" src="'+this.app.loadImage(data.imgPaths.cta[0])+'" /><img class="img1" src="'+this.app.loadImage(data.imgPaths.etc[0])+'" /><img class="img2" src="'+this.app.loadImage(data.imgPaths.etc[1])+'" /><img class="img3" src="'+this.app.loadImage(data.imgPaths.etc[2])+'" /></div><div class="screen2 screens"></div><div class="screen3 screens"><img src="'+this.app.loadImage(data.imgPaths.cta[1])+'" id="pelajari"></div></div>';
  this.app.contentTag.innerHTML = content;

  var screen2 = this.app.contentTag.querySelector('.screen2');

  var adForm = document.createElement('form');
  adForm.id = 'adform'
  for(var item in Object.keys(data.leadgenData.inputs)) {
    var name = Object.keys(data.leadgenData.inputs)[item];
    var value = data.leadgenData.inputs[name];

    if (typeof value === 'string' && value !== 'Date') {
      adForm.innerHTML += '<input type="text" placeholder="'+name.replace('_', ' ')+'" required>'
    }
  }

  adForm.innerHTML += '<input type="text" placeholder="'+Object.keys(data.leadgenData.inputs)[3]+'" id="datepicker" value="June 2, 2017" required onkeydown="return false;">';
  adForm.innerHTML += '<input type="image" src="'+this.app.loadImage(data.imgPaths.cta[2])+'" id="submit">'
  screen2.appendChild(adForm);

  this.app.loadCss(this.app.path + 'css/pikaday.css')
  this.app.loadJs(this.app.path + 'js/pikaday.js', function() {
    _self.picker = new Pikaday({
      field: document.getElementById('datepicker'),
      disableDayFn: function(d) {
        if(d.getDay() === 3 || d.getDay() === 5) return false
        return true
      },
      minDate: new Date(2017, 5, 2),
      maxDate: new Date(2017, 8, 29)
    })
  })

  this.events(this.app.contentTag);

  document.body.style.margin = '0px';
  document.body.style.padding = '0px';

  var css = '#rma-widget, .screens, .adcontainer { width: 320px; height: 480px; }';
  css += '.adcontainer, .adcontainer img, #adform { position: absolute; }'
  css += '.screen1 { background: url(' + this.app.loadImage(data.imgPaths.screens[0]) + ') no-repeat; display: ; }';
  css += '.screen2 { background: url(' + this.app.loadImage(data.imgPaths.screens[1]) + ') no-repeat; display: none; }';
  css += '.screen3 { background: url(' + this.app.loadImage(data.imgPaths.screens[2]) + ') no-repeat; display: none; }';

  css += '#daftar { left: '+((320/2-194/2)-5)+'px; bottom: 20px; }'
  css += '.img1, .img2, .img3 { top: 180px; }'
  css += '#adform { bottom: 70px; left: 23px; }'
  css += '#adform input, #adform select { font-size: 16px; display: block; width: 250px; padding: 10px; margin-top: 5px; border:none;  -webkit-appearance:none; }'
  css += '#adform input:focus { outline: 0;}'
  css += '#adform select { width: 275px; -webkit-appearance:none; margin-top: 5px; }'

  css += '#submit { bottom: -68px; left: 48px; width: 149px !important; position: absolute; }'
  css += '#pelajari { bottom: 40px; left: 48px; }';
  css += '@keyframes fade { 0% {opacity:1} 33.333% { opacity: 0} 66.666% { opacity: 0} 100% { opacity: 1} } @keyframes fade2 { 0% {opacity:0} 33.333% { opacity: 1} 66.666% { opacity: 0 } 100% { opacity: 0} } @keyframes fade3 { 0% {opacity:0} 33.333% { opacity: 0} 66.666% { opacity: 1} 100% { opacity: 0} }'
  css += '.img1 {animation:fade 16s infinite;-webkit-animation:fade 16s infinite;}'
  css += '.img2 {animation:fade2 16s infinite;-webkit-animation:fade2 16s infinite;}'
  css += '.img3 {animation:fade3 16s infinite;-webkit-animation:fade3 16s infinite;}'

  if (window.location.hostname.indexOf('localhost') > -1) {
    css += '.adcontainer { border: 1px solid red; }'
  }
  this.app.addStyle(css)
}

Adunit.prototype.events = function(c) {
  var self = this;
  var screen1 = c.querySelector('.screen1');
  var screen2 = c.querySelector('.screen2');
  var screen3 = c.querySelector('.screen3');
  var adform = c.querySelector('#adform');

  var data = this.app.data;
  screen1.addEventListener('click', function() {
    screen1.style.display = 'none';
    screen2.style.display = 'block';
    self.app.tracker('E', 'sign_up')
  });

  screen3.addEventListener('click', function() {
    self.app.linkOpener(data.landingPageUrl);
    self.app.tracker('E', 'landing')
  })

  adform.addEventListener('submit', function(e) {
    e.preventDefault();
    var isfalse = 0;
    this[1].style.border = '';
    this[2].style.border = ''
    if(!/^\d+$/.test(this[1].value)) {
      this[1].style.border = '1px solid red';
      isfalse += 1;
    }
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this[2].value)) {
      this[2].style.border = '1px solid red';
      isfalse += 1;
    }

    if (isfalse > 0 ) {
      return false;
    }

    var url = data.leadgenData.apiUrl.replace('nama', this[0].value);
      url = url.replace('nomor_hp', this[1].value);
      url = url.replace('email_input', this[2].value);
      url = url.replace('tanggal', this[3].value);
      url = url.replace('emailstosend', data.leadgenData.emails)

    self.app.tracker('E', 'submit')
    self.app.loadJs(url);

    var screen2 = document.querySelector('.screen2');
    var screen3 = document.querySelector('.screen3');
    screen2.style.display = 'none';
    screen3.style.display = 'block';

    return true;
  })
}

function leadGenCallback(e) {
  if (e.status) {
    var screen2 = document.querySelector('.screen2');
    var screen3 = document.querySelector('.screen3');
    screen2.style.display = 'none';
    screen3.style.display = 'block';
  }
}

new Adunit();
