/// Task-list messages in English.
exports.messages = {
  'addReport': 'Created task «addResult».',
  'doneMissingFail':
    'The removal was unsuccessful because no such task exists.',
  'doneReport': 'Completed the task \'«id+doneResult»\'.',
  'listCol0Head': 'ID',
  'listCol1Head': 'Description',
  'listSumReport1': '1 task.',
  'listSumReport2': '«rows.length» tasks.',
  'resetReport': 'The list is empty and the next ID is 1.',
  'commandFail': 'The command was unsuccessful because of a format error.',
  'helpTip': '\n==============================================\nThis application manages a simple to-do list.\nYou can add tasks to it, remove tasks from it\n(declaring them “done”), list the tasks in it,\nand reset it to its initial state.\n\nExamples of valid commands:\n\nnode task help\nnode task list\nnode task add \'Study calculus\'\nnode task done 4\nnode task done 13-18\nnode task reset\n==============================================\n'
};
