# Privacy Notice

This site uses simple counters to understand how often certain features are used.
A counter is incremented on page load, when a save file is successfully synced, and when a transcription image is exported.

No personal data, IP addresses, or identifiable information is collected.
All counter data is stored securely on a private server.

## Save File Donation

You may optionally submit your Rain World save file to help test and improve the application's save file parser.
This is strictly opt-in: data is only transmitted if you explicitly check the submission checkbox in the save file import dialog.

What is collected:
- The anonymized game save file (used solely for parser testing and debugging).
- Your browser's User-Agent string (to help reproduce browser-specific parsing issues).
- The timestamp of the upload.
- Your IP address is instantly hashed with a secret salt and used only for temporary spam prevention. The raw IP address is never written to disk.

Retention: Development data is periodically reviewed and manually deleted once it is no longer needed for testing purposes.

---

If you have any questions about this, please [open an issue](https://github.com/YanWittmann/rw-collection-index/issues/new).
You can always build this software yourself and host it locally to view the data without any API calls.
