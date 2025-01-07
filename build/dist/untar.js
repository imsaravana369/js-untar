((e,r)=>{"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?module.exports=r():e.untar=r()})(this,function(){function r(t){if("function"!=typeof Promise)throw new Error("Promise implementation not available in this environment.");var n=[],a=[];function i(e){for(var r=0,t=n.length;r<t;++r)n[r](e);a.push(e)}var o=new Promise(function(e,r){t(e,r,i)}),s=(o.progress=function(e){if("function"!=typeof e)throw new Error("cb is not a function.");for(var r=0,t=a.length;r<t;++r)e(a[r]);return n.push(e),o},o.then);return o.then=function(e,r,t){return s.call(o,e,r),void 0!==t&&o.progress(t),o},o}var s=(window||this).URL.createObjectURL(new Blob(['function UntarWorker(){}var worker;function decodeUTF8(e){for(var r="",t=0;t<e.length;){var a=e[t++];if(127<a){if(191<a&&a<224){if(t>=e.length)throw"UTF-8 decode: incomplete 2-byte sequence";a=(31&a)<<6|63&e[t]}else if(223<a&&a<240){if(t+1>=e.length)throw"UTF-8 decode: incomplete 3-byte sequence";a=(15&a)<<12|(63&e[t])<<6|63&e[++t]}else{if(!(239<a&&a<248))throw"UTF-8 decode: unknown multibyte start 0x"+a.toString(16)+" at index "+(t-1);if(t+2>=e.length)throw"UTF-8 decode: incomplete 4-byte sequence";a=(7&a)<<18|(63&e[t])<<12|(63&e[++t])<<6|63&e[++t]}++t}if(a<=65535)r+=String.fromCharCode(a);else{if(!(a<=1114111))throw"UTF-8 decode: code point 0x"+a.toString(16)+" exceeds UTF-16 reach";a-=65536,r=(r+=String.fromCharCode(a>>10|55296))+String.fromCharCode(1023&a|56320)}}return r}function PaxHeader(e){this._fields=e}function TarFile(){}function UntarStream(e){this._bufferView=new DataView(e),this._position=0}function UntarFileStream(e){this._stream=new UntarStream(e),this._globalPaxHeader=null}UntarWorker.prototype={onmessage:function(e){try{if("extract"!==e.data.type)throw new Error("Unknown message type: "+e.data.type);this.untarBuffer(e.data.buffer)}catch(e){this.postError(e)}},postError:function(e){this.postMessage({type:"error",data:{message:e.message}})},postLog:function(e,r){this.postMessage({type:"log",data:{level:e,msg:r}})},untarBuffer:function(e){try{for(var r=new UntarFileStream(e);r.hasNext();){var t=r.next();this.postMessage({type:"extract",data:t},[t.buffer])}this.postMessage({type:"complete"})}catch(e){this.postError(e)}},postMessage:function(e,r){self.postMessage(e,r)}},"undefined"!=typeof self&&(worker=new UntarWorker,self.onmessage=function(e){worker.onmessage(e)}),PaxHeader.parse=function(e){for(var r=new Uint8Array(e),t=[];0<r.length;){var a=parseInt(decodeUTF8(r.subarray(0,r.indexOf(32)))),n=decodeUTF8(r.subarray(0,a)).match(/^\\d+ ([^=]+)=(.*)\\n$/);if(null===n)throw new Error("Invalid PAX header data format.");var i=n[1],n=n[2],i=(0===n.length?n=null:null!==n.match(/^\\d+$/)&&(n=parseInt(n)),{name:i,value:n});t.push(i),r=r.subarray(a)}return new PaxHeader(t)},PaxHeader.prototype={applyHeader:function(t){this._fields.forEach(function(e){var r=e.name,e=e.value;"path"===r?(r="name",void 0!==t.prefix&&delete t.prefix):"linkpath"===r&&(r="linkname"),null===e?delete t[r]:t[r]=e})}},UntarStream.prototype={readString:function(e){for(var r=+e,t=[],a=0;a<e;++a){var n=this._bufferView.getUint8(this.position()+ +a,!0);if(0===n)break;t.push(n)}return this.seek(r),String.fromCharCode.apply(null,t)},readBuffer:function(e){var r,t,a;return"function"==typeof ArrayBuffer.prototype.slice?r=this._bufferView.buffer.slice(this.position(),this.position()+e):(r=new ArrayBuffer(e),t=new Uint8Array(r),a=new Uint8Array(this._bufferView.buffer,this.position(),e),t.set(a)),this.seek(e),r},seek:function(e){this._position+=e},peekUint32:function(){return this._bufferView.getUint32(this.position(),!0)},position:function(e){if(void 0===e)return this._position;this._position=e},size:function(){return this._bufferView.byteLength}},UntarFileStream.prototype={hasNext:function(){return this._stream.position()+4<this._stream.size()&&0!==this._stream.peekUint32()},next:function(){return this._readNextFile()},_readNextFile:function(){var e=this._stream,r=new TarFile,t=!1,a=null,n=e.position()+512;switch(r.name=e.readString(100),r.mode=e.readString(8),r.uid=parseInt(e.readString(8)),r.gid=parseInt(e.readString(8)),r.size=parseInt(e.readString(12),8),r.mtime=parseInt(e.readString(12),8),r.checksum=parseInt(e.readString(8)),r.type=e.readString(1),r.linkname=e.readString(100),r.ustarFormat=e.readString(6),-1<r.ustarFormat.indexOf("ustar")&&(r.version=e.readString(2),r.uname=e.readString(32),r.gname=e.readString(32),r.devmajor=parseInt(e.readString(8)),r.devminor=parseInt(e.readString(8)),r.namePrefix=e.readString(155),0<r.namePrefix.length)&&(r.name=r.namePrefix+"/"+r.name),e.position(n),r.type){case"0":case"":r.buffer=e.readBuffer(r.size);break;case"1":case"2":case"3":case"4":case"5":case"6":case"7":break;case"g":t=!0,this._globalPaxHeader=PaxHeader.parse(e.readBuffer(r.size));break;case"x":t=!0,a=PaxHeader.parse(e.readBuffer(r.size))}void 0===r.buffer&&(r.buffer=new ArrayBuffer(0));n+=r.size;return r.size%512!=0&&(n+=512-r.size%512),e.position(n),t&&(r=this._readNextFile()),null!==this._globalPaxHeader&&this._globalPaxHeader.applyHeader(r),null!==a&&a.applyHeader(r),r}};'])),t=window||this,e=t.URL||t.webkitURL;var f={blob:{get:function(){return this._blob||(this._blob=new Blob([this.buffer]))}},getBlobUrl:{value:function(){return this._blobUrl||(this._blobUrl=e.createObjectURL(this.blob))}},readAsString:{value:function(){var e=this.buffer,t=e.byteLength,n=new DataView(e);let a="";for(let r=0;r<t;r+=65536){var i=[],o=Math.min(r+65536,t);for(let e=r;e<o;++e){var s=n.getUint8(e);i.push(s)}a+=String.fromCharCode.apply(null,i)}return this._string=a}},readAsJSON:{value:function(){return JSON.parse(this.readAsString())}}};return function(e){if(!(e instanceof ArrayBuffer))throw new TypeError("arrayBuffer is not an instance of ArrayBuffer.");if(t.Worker)return new r(function(t,n,a){var i=new Worker(s),o=[];i.onerror=function(e){n(e)},i.onmessage=function(e){switch((e=e.data).type){case"log":console[e.data.level]("Worker: "+e.data.msg);break;case"extract":r=e.data,Object.defineProperties(r,f);o.push(r),a(r);break;case"complete":i.terminate(),t(o);break;case"error":i.terminate(),n(new Error(e.data.message));break;default:i.terminate(),n(new Error("Unknown message from worker: "+e.type))}var r},i.postMessage({type:"extract",buffer:e},[e])});throw new Error("Worker implementation is not available in this environment.")}});
//# sourceMappingURL=untar.js.map
