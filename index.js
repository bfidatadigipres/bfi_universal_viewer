var uv;



//
//
// require(['modules/uv-seadragoncenterpanel-module/SeadragonCenterPanel'], panel => {
//     const createUI = panel.SeadragonCenterPanel.prototype.createUI;
//
//     panel.SeadragonCenterPanel.prototype.createUI = (function() {
//
//         console.log(window.OpenSeadragon);
//
//         const OSD = window.OpenSeadragon;
//
//         // function NewOpenSeadragon(config) {
//         //     config.ajaxWithCredentials = true;
//         //     config.loadWithAjax = true;
//         //     return OSD(config);
//         // }
//
//         // window.OpenSeadragon.Viewer = NewOpenSeadragon;
//
//         const addTiledImage = OSD.Viewer.prototype.addTiledImage;
//
//         OSD.Viewer.prototype.addTiledImage = function (options) {
//
//             console.log(options);
//
//             options.ajaxWithCredentials = true;
//             options.loadTilesWithAjax = true;
//             options.crossOriginPolicy = true;
//
//             return addTiledImage.call(this, options);
//         }
//
//         createUI.call(this);
//         this.viewer.ajaxWithCredentials = true;
//         this.viewer.loadWithAjax = true;
//         console.log(this.viewer);
//     });
// })

$.ajaxSetup({
    xhrFields: {withCredentials: true}
})


requirejs.onResourceLoad = function (context, map, depArray) {
    if (map.name === 'lib/manifesto.js') {
        const originalLoad = window.Manifesto.loadManifest;
        window.Manifesto.Utils.loadResource = window.Manifesto.loadManifest = (url) => {
            return axios
                .get(url, { withCredentials: true })
                .then(function(r) {
                    return r.data;
                })
                // Remove if fallback behaviour is not desired
                .catch(function (err) {
                    return axios.get(url).then(function(r){ return r.data });
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
        configUri: 'uv-config.json',
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
    }).catch(error => {
        console.error('Got [' + JSON.stringify(error) + '] logging event [' + JSON.stringify(payload) + ']');
        logout();
    });
}

function logout() {
    window.location.replace('/logout')
}
