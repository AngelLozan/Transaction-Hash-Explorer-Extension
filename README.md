# 🔍 Block explorer Extension

![Helpscout Custom Logo](https://github.com/AngelLozan/Transaction-Hash-Explorer-Extension/blob/main/EXODUSblockchair.png?raw=true)

This project has been created using **webpack-cli**

This is a demo extension to test the capbilities of the blockchair api for an internal tool hackathon project. Will be utilized by over 100 employees. Branding, coloration and images are all according to Exodus brand guidelines. 

Run

```
npm run build
```

or

```
yarn build
```

to bundle your application



Notes:

- `devtools` included in config to remove eval from content script when build is run. Content security policy blocks eval. 

- Icons from FontAwesome. 

- No `permissions` needed yet, just placeholders in the manifest.

- To run build:  `webpack --mode development` or production depending

- Needs babel plugin in .babelrc in order to call async functions/ dynamic functions. https://babeljs.io/docs/en/plugins/. Also need to install the npm package. 

- Uses Axios to get data from free api.

Formatting of regex and assignment of variables will be expansive in the current form. I will first ensure the regex and api calls are successful, then I will pair down the JS to combine as many variables as possible and streamline the code. 


To Do:
- Save data from previous search in local storage to display after opening the app.
- Save data from previous search in URL list linking to transaction for reference?
- Regex and api string modification for other chains. 