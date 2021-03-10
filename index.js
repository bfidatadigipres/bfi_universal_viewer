let uv;

window.addEventListener('uvLoaded', function (e) {

    uv = createUV('#uv', {
        iiifResourceUri: 'https://bfinationalarchivemanifest.bfi.org.uk/works/150784974/manifest.json',
        configUri: 'uv-config.json'
    }, new UV.URLDataProvider());

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
    $.post({
        url: '/api/event',
        contentType: 'application/json',
        data: {
            'type': type,
            ...payload
        },
        dataType: 'json',
        success: function() {
            console.log('Successfully logged event [' + type + '] with payload [' + payload + ']');
        }
    });
}
