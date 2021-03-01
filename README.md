Fork of UniversalViewer/uv-hello-world that incorporates the Manifest URL-parsing functionality from UniversalViewer/examples - which lets you open the UV page at a  specific Manifest by passing the Manifest in the URL. 

#### Prerequisites

- [Git](https://git-scm.com/)
- [Node](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)

Once these are installed, git clone this repository to your file system, then run the following commands in your terminal:

```
cd bfi_universal_viewer
npm install
npm start
```

Then browse to `localhost:42001` or `172.18.7.xx:42001`(42001 was chosen randomly - it could be 50000 instead).

The `uv_start.sh` script can be run on crontab to check whether the Universal Viewer is running, and start it if it is not.
