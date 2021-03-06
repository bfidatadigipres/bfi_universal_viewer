var uv;

$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    },
    beforeSend: function(jqXHR, settings) {
        jqXHR.requestUrl = settings.url
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error('Got [' + errorThrown + '] logging request [' + jqXHR.requestUrl + ']');
        logout();
    }
})

requirejs.onResourceLoad = function (context, map, depArray) {
    if (map.name === 'lib/manifesto.js') {
        const originalLoad = window.Manifesto.loadManifest;
        window.Manifesto.Utils.loadResource = window.Manifesto.loadManifest = function (url) {
            return axios.get(url, {
                withCredentials: true,
                validateStatus: status => status === 200 || status === 204
            }).then(function(r) {
                return r.data;
            }).catch(function (error) {
                console.error('Got [' + JSON.stringify(error) + '] logging request [' + url + ']');
                logout();
            });
        };
    }
}

window.addEventListener('uvLoaded', function (e) {

    var manifest = Utils.Urls.getHashParameter('manifest');
    var urlDataProvider = new UV.URLDataProvider();
    var collectionIndex = urlDataProvider.get('c');

    if(!manifest) {
        manifest = 'https://bfinationalarchivemanifest.bfi.org.uk/collections/stills.json'
    }

    uv = createUV('#uv', {
        iiifResourceUri: manifest,
        configUri: 'config.json',
        collectionIndex: (collectionIndex !== undefined) ? Number(collectionIndex) : undefined,
        manifestIndex: Number(urlDataProvider.get('m', 0)),
        sequenceIndex: Number(urlDataProvider.get('s', 0)),
        canvasIndex: Number(urlDataProvider.get('cv', 0)),
        rotation: Number(urlDataProvider.get('r', 0)),
        rangeId: urlDataProvider.get('rid', ''),
        xywh: urlDataProvider.get('xywh', '')
    }, urlDataProvider);

    uv.on('created', function() {
        Utils.Urls.setHashParameter('manifest', manifest);
    })

    uv.on('showDownloadDialogue', function () {
        logEvent('download_panel_opened', {
            manifest: extractManifestId(uv),
            canvas: extractCanvasId(uv)
        });
    });

    uv.on('manifestIndexChanged', function (manifestIndex) {
        logEvent('resource_loaded', {
            uri: extractManifestId(uv)
        })
    });

    uv.on('canvasIndexChanged', function (canvasIndex) {
        logEvent('image_changed', {
            manifest: extractManifestId(uv),
            canvas: extractCanvasId(uv)
        });
    });

}, false);

function extractManifestId(uv) {
    return uv.extension.helper.manifest.id;
}

function extractCanvasId(uv) {
    return uv.extension.helper.getCurrentCanvas().id;
}

function logEvent(type, payload) {
    payload.type = type;
    axios.post('/api/event', payload, {
        headers: {
            'Content-Type': 'application/json',
        },
        validateStatus: status => status === 200 || status === 204
    }).catch(function (error) {
        console.error('Got [' + JSON.stringify(error) + '] logging event [' + JSON.stringify(payload) + ']');
        logout();
    });
}

function logout() {
    window.location.replace('/logout')
}
