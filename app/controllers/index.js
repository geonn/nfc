var nfc = require('ti.nfc');
var nfcAdapter = null;
var dispatchFilter = null;

$.index.addEventListener('open', function(e) {
	setupNfc();
});

$.index.open();

function setupNfc() {
	nfcAdapter = nfc.createNfcAdapter({
		onNdefDiscovered: handleDiscovery,
		onTagDiscovered: handleDiscovery,
		onTechDiscovered: handleDiscovery
	});
	
	if (!nfcAdapter.isEnabled()) {
		alert('NFC is not enabled on this device');
		return;
	}
	
	var act = Ti.Android.currentActivity;
	act.addEventListener('newintent', function(e) {
		nfcAdapter.onNewIntent(e.intent);
		console.log("on new intent: "+nfcAdapter.onNewIntent(e.intent));
	});
	
	act.addEventListener('resume', function(e) {
		nfcAdapter.enableForegroundDispatch(dispatchFilter);
		console.log("enable foreground dispatch: "+nfcAdapter.enableForegroundDispatch(dispatchFilter));
	});
	act.addEventListener('pause', function(e) {
		nfcAdapter.disableForegroundDispatch();
		console.log("disable foreground dispatch: "+nfcAdapter.disableForegroundDispatch());
	});
	
	dispatchFilter = nfc.createNfcForegroundDispatchFilter({
		intentFilters: [
			{ action: nfc.ACTION_NDEF_DISCOVERED, mimeType: '*/*' },
			{ action: nfc.ACTION_NDEF_DISCOVERED, scheme: 'http' }
		],
		techLists: [
			[ "android.nfc.tech.NfcF" ],
			[ "android.nfc.tech.Ndef" ],
			[ "android.nfc.tech.MifareClassic" ],
			[ "android.nfc.tech.NfcA" ]
		]
	});
	
	var textRecord = nfc.createNdefRecordText({
		text: "NDEF Push Sample"
	});
	var msg = nfc.createNdefMessage({
		records: [ textRecord ]
	});
	nfcAdapter.setNdefPushMessage(msg);
	console.log("set ndef push message: "+nfcAdapter.setNdefPushMessage(msg));
}

function handleDiscovery(e) {
	$.tagData.value = JSON.stringify(e, function(key, value) {
    	if(key === 'source') {
        	return undefined;
    	} else {
    		console.log("value: "+value);
        	return value;
    	}
	}, 2);
}

function onClear(e) {
	$.tagData.value = "";
}