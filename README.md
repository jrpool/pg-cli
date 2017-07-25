# pg-cli

Application using a PostgreSQL database and a CLI to query and modify it asynchronously.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## modules

```
- task.js
commands
- add.js
- done.js
- list.js
src
- messages.js
```

## Discussion

### General

This application demonstrates the use of a [PostgreSQL][pg] database and the [`npm`][npm] [`pg` package][npmpg] to read and modify the content of the database in response to commands issued from the command line.

The demonstration takes the form of a to-do list manager. You can use it to add tasks to the list, remove tasks from it (declaring them “done”), and list the tasks in it.

The application fulfills the requirements of the “Command line Todo List With SQL” module in Phase 2 of the [Learners Guild][lg] curriculum.

The output text strings of the interface are separated from the code in a `messages.js` module and labeled as being the task-list messages in English. For parallel versions in additional languages, and/or in other domains (such as inventory management), other message blocks could be added and options to choose the applicable block could be added to the interface.

Except for the `help` command, there is a complete division of labor between validation/assignment and fulfillment. The `task` module evaluates each command and, if it is valid, assigns its fulfillment to another appropriate module: `add`, `list`, `done`, or `reset`. After the assignment, the `task` module does nothing else. It receives no report back from the assignee, and it is the assignee, rather than `task`, that is responsible for notifying the user of the outcome.

In this implementation, reporting that a task has been completed results in the removal of the task from the list, rather than the task being marked as done.

### Extras

Features exceeding the specified requirements include the following:

- The `done` command takes not only an integer argument but instead, optionally, a range argument in the format of 2 integers delimited by a hyphen-minus character (e.g., `15-20`).

- A `help` command causes a document describing the possible commands to be output.

- The `done` command produces a report showing not only the description of the completed task, but also its ID. In the event that `done` has a range argument, and multiple tasks in the range have identical descriptions, a report needs to include IDs in order to positively identify the removed tasks.

- A `reset` command reinitializes the application, once the database contains no tasks, so that the next task added will have ID 1. Without resets, IDs are not reused after their tasks are removed.

- A `copy-edit-files` module copies a specified directory tree to a specified new location and performs a specified global search-and-replace operation on each regular file in the destination version of the tree. It was added to this application for the purpose of enabling dual versions of the source code: a version for persons with little or no knowledge of JavaScript and a version for experienced JavaScript programmers. The former contains extensive comments to explain the code to readers who cannot interpret it but want to know the logic of the implementation. The latter version excludes comments introduced by standard non-JSDoc introducers. This module permits the specification of any regular expression to be matched and any string that should replace matching substrings. It also supports named rules and names the above-described comment-stripping rule `uncomment`. The extensively commented versions of the source files are located in the `doc` directory.

## Installation and Setup

0. These instructions presuppose that [npm][npm] is installed.

1. Your copy of this project will be located in its own directory, inside some other directory that you may choose or create. For example, to create that parent directory inside your own home directory’s `Documents` subdirectory and call it `projects`, you can execute:

    `mkdir ~/Documents/projects`

Make that parent directory your working directory, by executing, for example:

    `cd ~/Documents/projects`

2. Clone this project’s repository into it, thereby creating the project directory, named `pg-cli`, by executing:

    `git clone https://github.com/jrpool/pg-cli.git pg-cli`

2. Make the project directory your working directory by executing:

    `cd pg-cli`

3. Install required dependencies (you can see them listed in `package.json`) by executing:

    `npm i`

## Usage and Examples

Enter `node task help` for usage examples. Then enter any command based on any of the examples. Any command that begins with `node task` should produce a response that describes either the successful execution of your command or an error.

To perform linting, execute `npm run lint`.

To perform the supplied tests, execute `npm test`.

[lg]: https://www.learnersguild.org
[npm]: https://www.npmjs.com/
[npmpg]: https://www.npmjs.com/package/pg
[pg]: https://www.postgresql.org/
