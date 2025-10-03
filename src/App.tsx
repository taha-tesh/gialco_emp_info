import { useState } from 'react';
import { EmployeeForm } from './components/EmployeeForm';
import { AdminPage } from './components/AdminPage';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={() => setShowAdmin((v) => !v)}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
        >
          {showAdmin ? 'العودة إلى الاستمارة' : 'لوحة الإدارة'}
        </button>
      </div>
      <div className="flex items-center justify-center">
        {showAdmin ? <AdminPage /> : <EmployeeForm />}
      </div>
    </div>
  );
}

export default App;
