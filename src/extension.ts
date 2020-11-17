import * as vscode from "vscode";
import { Result, SassError } from "node-sass";
const sass = require("sass");

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "seltocss" is now active!');

  let disposable = vscode.commands.registerCommand(
    "seltocss.selectedToCss",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(messages.noEditor);
        return;
      }
      const text = editor.document.getText(editor.selection);
      if (!text) {
        vscode.window.showInformationMessage(messages.noSelection);
        return;
      }

      try {
        const getCss = await renderSass(text);
        editor.edit((edit) => edit.replace(editor.selection, getCss));
        vscode.window.showInformationMessage(messages.transformed);
      } catch (error) {
        throw new Error(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

const renderSass = (selection: string) => {
  return new Promise<string>((resolve, reject) => {
    sass.render(
      {
        data: selection,
        indentedSyntax: false,
      },
      function (err: SassError, result: Result) {
        if (err) {
          reject(new Error(err.message));
        }
        if (result) {
          resolve(result.css.toString());
        }
      }
    );
  });
};

const messages = {
  transformed: "Selected text transformed",
  noSelection: "Nothing was selected to transform",
  noEditor: "No editor opened",
};

export function deactivate() {}
