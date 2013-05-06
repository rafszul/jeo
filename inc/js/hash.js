(function($) {

	mappress.fragment = function() {

        var f = {};
        var _set = function(query) {
            var hash = [];
            _.each(query, function(v, k) {
                hash.push(k + '=' + v);
            });
            document.location.hash = '!/' + hash.join('|||');
        };
        var _replaceAll = function(string, token, newtoken) {
			var p = new RegExp(eval("/" + token + "/g"));
			return string.replace(p, newtoken);
		}
        f.set = function(options) {
            _set(_.extend(f.get(), options));
        };
        f.get = function(key, defaultVal) {
        	var vars = document.location.hash.substring(3);

        	// safe fallback
        	if(vars.indexOf('&') != -1)
        		vars = _replaceAll(vars, '&', '|||');

       		vars = vars.split('|||');
            var hash = {};
            _.each(vars, function(v) {
                var pair = v.split("=");
                if (!pair[0] || !pair[1]) return;
                hash[pair[0]] = unescape(pair[1]);
                if (key && key == pair[0]) {
                    defaultVal = hash[pair[0]];
                }
            });
            return key ? defaultVal : hash;
        };
        f.rm = function(key) {
            var hash = f.get();
            hash[key] && delete hash[key];
            _set(hash);
        };
        return f;

	}

	var fragment = mappress.fragment();

	mappress.fragmentEnabled = false;

	var setupHash = function(map) {

		if(map.conf.disableHash || map.conf.admin || !map.conf.mainMap)
			return false;

		mappress.fragmentEnabled = true;

		var track = _.debounce(function(m) {
			var c = m.center();
			(isNumber(c.lat) && isNumber(c.lon) && isNumber(m.zoom())) &&
			fragment.set({loc: [c.lat, c.lon, parseInt(m.zoom())].join(',')});
		}, 400);
		map.addCallback('zoomed', track);
		map.addCallback('panned', track);
		fragment.get('full') && map.ui.fullscreen.full();
		fragment.get('iframe') && $('body').addClass('iframe');

		var loc = fragment.get('loc');
		if(loc) {
			loc = loc.split(',');
			if(loc.length = 3) {
				var center = {
					lat: parseFloat(loc[0]),
					lon: parseFloat(loc[1])
				};
				var zoom = parseInt(loc[2]);
			}
		}
		map.centerzoom(center, zoom, false);

		// fullscreen hash
		map.addCallback('drawn', function() {
			if(map.$.hasClass('map-fullscreen-map')) {
				fragment.set({full: true});
			} else {
				fragment.rm('full');
			}
		});
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	mappress.mapReady(setupHash);

})(jQuery);