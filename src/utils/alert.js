import Swal from 'sweetalert2';

// Toast notification (auto-closes, top-end position)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/**
 * Show a success toast notification
 */
export const showSuccess = (message) => {
  return Toast.fire({
    icon: 'success',
    title: message,
  });
};

/**
 * Show an error toast notification
 */
export const showError = (message) => {
  return Toast.fire({
    icon: 'error',
    title: message,
  });
};

/**
 * Show a warning toast notification
 */
export const showWarning = (message) => {
  return Toast.fire({
    icon: 'warning',
    title: message,
  });
};

/**
 * Show an info toast notification
 */
export const showInfo = (message) => {
  return Toast.fire({
    icon: 'info',
    title: message,
  });
};

/**
 * Show a confirmation dialog (returns true if confirmed)
 */
export const showConfirm = async (title, text, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return result.isConfirmed;
};

/**
 * Show a delete confirmation dialog (red themed)
 */
export const showDeleteConfirm = async (itemName) => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa?',
    html: `Bạn có chắc muốn xóa <strong>${itemName}</strong>?<br>Hành động này không thể hoàn tác!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

/**
 * Show a detailed success alert (centered)
 */
export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#6366f1',
  });
};

/**
 * Show a detailed error alert (centered)
 */
export const showErrorAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#6366f1',
  });
};

/**
 * Show a detailed info alert (centered)
 */
export const showInfoAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#6366f1',
  });
};
