# ClearClipboard

##Jan 2025 Update:  This plugin does not support MV3 and cannot be ported to support it.  MV3 blocks modifying the clipboard without a "user gesture." Closing a window doesn't count so the only way to make it work is to force a popup that a user can click on to clear the clipboard.  This solution is a horrible workflow and ruins the ergonomics of the plugin.  I appreciate the need for security, but the lack of escape hatch for these features shows a lack of respect for users and a nanny mentality. 

A Chrome extension to clear your clipboard after exiting an incognito tab or window.  

Make sure to allow this addon in incognito mode from the extension page or it won't do anything.
![Allow in Incognito](/incognito.PNG)

Seems like no one thinks this should be a feature of incognito mode:  
https://bugs.chromium.org/p/chromium/issues/detail?id=46131  
https://www.ghacks.net/2014/07/24/mozilla-changes-private-browsing-clipboard-handling-firefox-33

