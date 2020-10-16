#!/bin/bash

count=$(pgrep -fc bfi-universal-viewer)

if (( $count > 0))
then
    echo "Universal Viewer is running" > runlog
else
    echo "Universal Viewer is not running - starting it now" > runlog
    cd /home/datadigipres/code/test_universal_viewer && npm start
fi
