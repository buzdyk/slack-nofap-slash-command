# NoFAP

This slack slash command helps to track NoFAP periods in your life. More info coming soon!

Setup:

1. Follow steps 1-4 from [Serverless Quick Start](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)
1. Deploy the app via `sls deploy`

There are several ways to test while developing:

1. Setup slack app and hook it up to the url provided by `sls deploy`
1. Post data to the same url via Postman
1. Test with MochaJS - `npm run mocha`. This is the most convenient approach
