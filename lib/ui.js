import toastClasses from "../styles/Toast.module.css";
import dayjs from "../lib/time";
import classNames from "classnames";

export function getErrorText(error) {
  let text = "Неизвестная ошибка";
  if (error.code === "ERROR_ACCOUNT_IS_BANED") {
    text = "Аккаунт заблокирован до " + dayjs(error.params[0]).locale("ru").calendar();
  } else if (error.code === "ERROR_GONE") {
    text = "Этой публикации уже нет";
  } else if (error.code === "E_CANT_DOWN") {
    text = "Вы не можете ставить отрицательные оценки";
  }
  return text;
}

export function showErrorToast(target, error, onClose = null, hold = 2000, topOffset = 10) {
  const text = getErrorText(error);
  return showButtonToast(target, text, onClose, hold, topOffset, toastClasses.error);
}

/**
 * @param {Element} target
 * @param {string} text
 * @param {?(() => undefined)} onClose
 * @param {number} hold
 * @param {number} topOffset
 * @param {string} className
 */
export function showButtonToast(target, text, onClose = null, hold = 2000, topOffset = 10, className = "") {
  const bodyOffset = Math.abs(document.body.getBoundingClientRect().top);
  const targetBB = target.getBoundingClientRect();

  const toast = document.createElement("div");
  toast.className = classNames(toastClasses.toast, className);
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
