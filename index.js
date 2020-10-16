var uv, manifest, urlDataProvider;

window.addEventListener('uvLoaded', function(e) { 

    urlDataProvider = new UV.URLDataProvider();

    loadManifests(function() {
        setSelectedManifest();
        setupUV();
    });

}, false);

function setupUV() {

    var collectionIndex = urlDataProvider.get('c');

    var data = {
        iiifResourceUri: manifest,
        configUri: 'examples-config.json',
        collectionIndex: (collectionIndex !== undefined) ? Number(collectionIndex) : undefined,
        manifestIndex: Number(urlDataProvider.get('m', 0)),
        sequenceIndex: Number(urlDataProvider.get('s', 0)),
        canvasIndex: Number(urlDataProvider.get('cv', 0)),
        rotation: Number(urlDataProvider.get('r', 0)),
        rangeId: urlDataProvider.get('rid', ''),
        xywh: urlDataProvider.get('xywh', '')
    };

    uv = createUV('#uv', data, urlDataProvider);

    uv.on('created', function() {
        Utils.Urls.setHashParameter('manifest', manifest);
        console.log('parsed metadata', uv.extension.helper.manifest.getMetadata());
        console.log('raw jsonld', uv.extension.helper.manifest.__jsonld);
    });

}

function loadManifests(cb) {

    // load manifests
    $.getJSON('manifests.json', function(manifests) {

        var $manifestSelect = $('#manifestSelect');

        for (var i = 0; i < manifests.collections.length; i++) {
            var collection = manifests.collections[i];

            if (collection.visible === false) {
                continue;
            }

            $manifestSelect.append('<optgroup label="' + collection.label + '">');

            for (var j = 0; j < collection.manifests.length; j++) {
                var manifest = collection.manifests[j];

                if (manifest.visible !== false) {
                    $manifestSelect.append('<option value="' + manifest['@id'] + '">' + manifest.label + '</option>');
                }
            }

            $manifestSelect.append('</optgroup>');      
        }

        cb();
    });
}

function setSelectedManifest() {

    manifest = Utils.Urls.getHashParameter('manifest');

    if (manifest) {
        $('#manifestSelect').val(manifest);
    } else {
        var options = $('#manifestSelect option');

        if (options.length) {
            manifest = options[0].value;
        }
    }

    $('#manifest').val(manifest);
}

$('#manifestSelect').on('change', function() {
    $('#manifest').val($('#manifestSelect option:selected').val());
});

$('#setManifestButton').on('click', function() {
    manifest = $('#manifest').val();

    uv.set({
        iiifResourceUri: manifest,
        collectionIndex: undefined,
        manifestIndex: 0,
        sequenceIndex: 0,
        canvasIndex: 0
    });
});