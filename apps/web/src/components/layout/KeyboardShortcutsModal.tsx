import Modal from "../ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

const shortcuts = [
  {
    keys: "Ctrl + K",
    action: "Open Search",
  },
  {
    keys: "Esc",
    action: "Close Dialogs",
  },
  {
    keys: "Ctrl + B",
    action: "Open Blocker",
  },
  {
    keys: "Ctrl + J",
    action: "Open Journal",
  },
  {
    keys: "Ctrl + Shift + A",
    action: "Open AI Coach",
  },
];

export default function KeyboardShortcutsModal({
  open,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard Shortcuts"
    >
      <div className="space-y-3">

        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.keys}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <span className="text-slate-300">
              {shortcut.action}
            </span>

            <kbd className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-teal-400">
              {shortcut.keys}
            </kbd>

          </div>
        ))}

      </div>
    </Modal>
  );
}