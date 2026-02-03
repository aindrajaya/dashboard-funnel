import toast from 'react-hot-toast';

const toastStyle = {
  border: '2px solid #1a1a1a',
  padding: '16px',
  color: '#1a1a1a',
  fontFamily: "'Architects Daughter', cursive",
  boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
  borderRadius: '0.5rem',
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'bottom-right',
      style: toastStyle,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'bottom-right',
      style: toastStyle,
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'bottom-right',
      icon: 'ℹ️',
      style: toastStyle,
    });
  },
  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="font-['Architects_Daughter'] text-sm font-bold">{message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="rounded-md border-2 border-gray-900 bg-white px-3 py-1.5 font-['Architects_Daughter'] text-sm transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="rounded-md border-2 border-gray-900 bg-red-600 px-3 py-1.5 font-['Architects_Daughter'] text-sm text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'bottom-center',
          style: {
            ...toastStyle,
            marginBottom: '80px',
          },
        }
      );
    });
  },
};
