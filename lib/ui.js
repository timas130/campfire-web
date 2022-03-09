import classes from "../styles/Toast.module.css";

/**
 * @param {Element} target
 * @param {string} text
 * @param {?(() => undefined)} onClose
 * @param {number} hold
 * @param {number} topOffset
 */
export function showButtonToast(target, text, onClose = null, hold = 2000, topOffset = 10) {
  const bodyOffset = Math.abs(document.body.getBoundingClientRect().top);
  const targetBB = target.getBoundingClientRect();

  const toast = document.createElement("div");
  toast.className = classes.toast;
  toast.innerText = text;
  document.body.appendChild(toast);

  const toastBB = toast.getBoundingClientRect();
  toast.style.top = `${Math.max(bodyOffset + targetBB.top - toastBB.height - (topOffset || 10), 0)}px`;
  toast.style.left = `${Math.max(targetBB.left - toastBB.width / 2 + targetBB.width / 2, 0)}px`;

  setTimeout(() => {
    toast.remove();
    onClose && onClose();
  }, hold || 2000);
}
