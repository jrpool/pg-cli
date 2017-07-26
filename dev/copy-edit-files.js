/// Cautiously copy and edit files in a directory tree.

const fs = require('fs');

const cpr = require('cpr');

/**
  =========
  FUNCTIONS
  =========
*/

/// Define a function to validate calling arguments.
const areValid = args => {
  return (
    args.length > 2 && args.length < 5
    && args.every(arg => arg !== undefined && typeof arg === 'string')
    && args.slice(0, 2).every(arg => arg.length)
    && args[0][0] === '/' && args[1][0] === '/'
    && !args[1].startsWith(args[0])
    && !args[0].startsWith(args[1])
    && (args.length === 3 || /^\/.+\/$/.test(args[2]))
  );
};

/**
  Define a function to report an error in a specified context caused by a
  specified pathname.
*/
const reportError = (err, context, pathname) => {
  if (err) {
    console.log('[' + context + '] (' + pathname + '): ' + err.message);
  }
};

/**
  Define a function to obtain editing parameters from arguments.
  Preconditions:
    0. The count of arguments is 1 or 2.
    1. If there are 2 arguments, argument 0 is a nonblank regular expression
      and argument 1 is a string.
    2. If there is 1 argument, it is the name of a known editing rule.
*/
const getEditParams = args => {
  if (args.length === 2) {
    try {
      const arg0RegExp = RegExp(args[0], 'mg');
      return [arg0RegExp, args[1]];
    }
    catch (err) {
      reportError(err, 'getEditParams', args[0]);
    }
  }
  else if (args.length === 1) {
    const rule = args[0];
    if (rule === 'uncomment') {
      return [RegExp('^ *\\/\\/ .+\n|^ *\\/\\*\n[^]+?\\*\\/\n', 'mg'), ''];
    }
    else {
      console.log('[getEditParams]' + args[0] + '?');
    }
  }
};

/**
  Define a function that tries to create a specified directory and, if the creation succeeds, executes a specified function.
*/
const mkdirAndDo = (dirPath, callback) => {
  fs.mkdir(dirPath, 0o700, callback);
};

/**
  Define a function to cautiously copy the non-hidden items in a directory
  tree and populate the list of destination pathnames.
*/
const treeCopy = (fromDir, toDir, nextFunction) => {
  cpr(
    fromDir,
    toDir,
    {
      confirm: true,
      filter: /\/\./
    },
    (err, destinationPaths) => {
      if (err) {
        reportError(err, 'treeCopy', fromDir);
      }
      else {
        nextFunction(destinationPaths);
      }
    }
  );
};

/**
  Define a function to return a function that reports an error in a
  specified context caused by a specified pathname.
*/
const reportErrorFn = (context, pathname) => {
  return err => {
    reportError(err, context, pathname);
  };
};

/**
  Define a function that returns a function that edits a specified file
  in accord with specified parameters.
*/
const editFileFn = (pathname, editParams) => {
  return (err, data) => {
    if (err) {
      reportError(err, 'editFiles/readFile', pathname);
    }
    else {
      const editedContent = data.replace(...editParams);
      fs.writeFile(
        pathname,
        editedContent,
        'utf8',
        reportErrorFn('editFiles/writeFile', pathname)
      );
    }
  };
};

/**
  Define a function to edit the files in a specified array of pathnames
  in accord with a specified rule.
*/
const editFiles = (pathnames, editParams) => {
  for (const pathname of pathnames) {
    fs.stat(
      pathname,
      (err, stats) => {
        if (stats.isFile()) {
          fs.readFile(
            pathname,
            'utf8',
            editFileFn(pathname, editParams)
          );
        }
      }
    );
  }
};

/**
  =========
  EXECUTION
  =========
*/
const callArgs = process.argv.slice(2);
if (areValid(callArgs)) {
  const editParams = getEditParams(callArgs.slice(2));
  if (editParams) {
    /**
      Create the destination directory. When the creation is complete,
      copy the specified files into it and edit them as specified.
    */
    mkdirAndDo(
      callArgs[1],
      (err) => {
        if (err) {
          console.log('[mkdirAndDo]' + err.message);
        }
        else {
          treeCopy(
            callArgs[0],
            callArgs[1],
            pathList => {editFiles(pathList, editParams);}
          );
        }
      }
    );
  }
  else {
    console.log('[editParams]Error');
  }
}
else {
  console.log('[callArgs]Error');
}
