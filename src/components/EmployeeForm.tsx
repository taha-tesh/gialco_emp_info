import { useState } from 'react';
import { CircleUser as UserCircle, Calendar, Users, Heart, Phone, Mail, MapPin, GraduationCap, CreditCard, Activity, Shield, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  fullName: string;
  nationalId: string;
  birthDate: string;
  sex: string;
  maritalStatus: string;
  numberOfChildren: string;
  phoneNumber: string;
  email: string;
  address: string;
  healthSituation: string;
  studyingDegree: string;
  educationLevel: string;
  schoolYear: string; // for primary/middle/high
  bloodType: 'A' | 'B' | 'O' | 'AB' | '';
  bloodRh: '+' | '-' | '';
  militaryService: string;
  previousJobs: string;
  remarks: string;
}

export function EmployeeForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    nationalId: '',
    birthDate: '',
    sex: '',
    maritalStatus: 'single',
    numberOfChildren: '0',
    phoneNumber: '',
    email: '',
    address: '',
    healthSituation: '',
    studyingDegree: '',
    educationLevel: '',
    schoolYear: '',
    bloodType: '',
    bloodRh: '',
    militaryService: '',
    previousJobs: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const needsYear = ['primary', 'middle', 'high'].includes(formData.educationLevel);
      const educationLevelWithYear = needsYear && formData.schoolYear
        ? `${formData.educationLevel} - السنة: ${formData.schoolYear}`
        : formData.educationLevel;
      const healthWithBlood = formData.bloodType && formData.bloodRh
        ? `${formData.healthSituation}${formData.healthSituation ? ' | ' : ''}فصيلة الدم: ${formData.bloodType}${formData.bloodRh}`
        : formData.healthSituation;

      const { data, error } = await supabase.from('employees').insert([
        {
          full_name: formData.fullName,
          national_id: formData.nationalId,
          birth_date: formData.birthDate,
          sex: formData.sex,
          marital_status: formData.maritalStatus,
          number_of_children: formData.maritalStatus === 'married' ? parseInt(formData.numberOfChildren) : 0,
          phone_number: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          health_situation: healthWithBlood,
          studying_degree: formData.studyingDegree,
          education_level: educationLevelWithYear,
          military_service: formData.militaryService,
          previous_jobs: formData.previousJobs,
          remarks: formData.remarks,
        },
      ]).select();

      if (error) throw error;

      if (data && data[0]) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-to-excel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employeeId: data[0].id }),
        });
      }

      setMessage({ type: 'success', text: 'تم إرسال معلومات الموظف بنجاح!' });
      setFormData({
        fullName: '',
        nationalId: '',
        birthDate: '',
        sex: '',
        maritalStatus: 'single',
        numberOfChildren: '0',
        phoneNumber: '',
        email: '',
        address: '',
        healthSituation: '',
        studyingDegree: '',
        educationLevel: '',
        schoolYear: '',
        bloodType: '',
        bloodRh: '',
        militaryService: '',
        previousJobs: '',
        remarks: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل في إرسال المعلومات. يرجى المحاولة مرة أخرى.' });
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10" dir="rtl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <UserCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">استمارة معلومات الموظف</h1>
        <p className="text-sm sm:text-base text-gray-600">يرجى تقديم تفاصيلك الشخصية والتعليمية والصحية</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-center text-sm sm:text-base ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-emerald-50 p-4 sm:p-6 rounded-xl border border-emerald-100">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-800 mb-4 flex items-center">
            <UserCircle className="w-5 h-5 ml-2" />
            المعلومات الشخصية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="fullName" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCircle className="w-4 h-4 ml-2" />
                الاسم الكامل
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            <div>
              <label htmlFor="nationalId" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 ml-2" />
                رقم الهوية الوطنية
              </label>
              <input
                type="text"
                id="nationalId"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
                placeholder="أدخل رقم الهوية"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 ml-2" />
                تاريخ الميلاد
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
              />
            </div>

            <div>
              <label htmlFor="sex" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 ml-2" />
                الجنس
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white text-right"
              >
                <option value="">اختر...</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4 ml-2" />
                الحالة الاجتماعية
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white text-right"
              >
                <option value="single">أعزب</option>
                <option value="married">متزوج</option>
              </select>
            </div>

            {formData.maritalStatus === 'married' && (
              <div className="transition-all">
                <label htmlFor="numberOfChildren" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 ml-2" />
                  عدد الأطفال
                </label>
                <input
                  type="number"
                  id="numberOfChildren"
                  name="numberOfChildren"
                  value={formData.numberOfChildren}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-100">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <Phone className="w-5 h-5 ml-2" />
            معلومات الاتصال
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 ml-2" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right"
                placeholder="05xxxxxxxx"
              />
            </div>

            <div>
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 ml-2" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right"
                placeholder="example@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 ml-2" />
                العنوان
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-right resize-none"
                placeholder="أدخل عنوانك الكامل"
              />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 sm:p-6 rounded-xl border border-purple-100">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 ml-2" />
            المعلومات الصحية
          </h2>

          <div>
            <label htmlFor="healthSituation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Activity className="w-4 h-4 ml-2" />
              الحالة الصحية
            </label>
            <textarea
              id="healthSituation"
              name="healthSituation"
              value={formData.healthSituation}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-right resize-none"
              placeholder="وصف الحالة الصحية (مثل: جيدة، يعاني من أمراض مزمنة مع ذكر المرض ، إلخ)"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">فصيلة الدم</span>
              <div className="flex flex-wrap gap-3">
                {(['A','B','O','AB'] as const).map((t) => (
                  <label key={t} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bloodType"
                      value={t}
                      checked={formData.bloodType === t}
                      onChange={handleChange}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">العامل الريزيسي</span>
              <div className="flex gap-3">
                {(['+','-'] as const).map((r) => (
                  <label key={r} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bloodRh"
                      value={r}
                      checked={formData.bloodRh === r}
                      onChange={handleChange}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-amber-100">
          <h2 className="text-lg sm:text-xl font-semibold text-amber-800 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 ml-2" />
            المعلومات التعليمية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="educationLevel" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 ml-2" />
                المستوى التعليمي
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white text-right"
              >
                <option value="">اختر...</option>
                <option value="primary">الابتدائية</option>
                <option value="middle">المتوسطة</option>
                <option value="high">الثانوية</option>
                
                <option value="diploma">دبلوم</option>
                <option value="bachelor">بكالوريوس</option>
                <option value="master">ماجستير</option>
                <option value="phd">دكتوراه</option>
              </select>
            </div>

            {(['primary','middle','high'] as const).includes(formData.educationLevel as any) && (
              <div>
                <label htmlFor="schoolYear" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 ml-2" />
                  السنة الدراسية
                </label>
                <select
                  id="schoolYear"
                  name="schoolYear"
                  value={formData.schoolYear}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white text-right"
                >
                  <option value="">اختر السنة...</option>
                  {(formData.educationLevel === 'primary' ? [1,2,3,4,5]
                    : formData.educationLevel === 'middle' ? [1,2,3,4]
                    : [1,2,3]
                  ).map((y) => (
                    <option key={y} value={String(y)}>السنة {y}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="studyingDegree" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 ml-2" />
                التخصص الدراسي
              </label>
              <input
                type="text"
                id="studyingDegree"
                name="studyingDegree"
                value={formData.studyingDegree}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-right"
                placeholder="أدخل تخصصك الدراسي"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-100">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 ml-2" />
            الخدمة العسكرية والخبرات السابقة
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="militaryService" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 ml-2" />
                الخدمة العسكرية
              </label>
              <select
                id="militaryService"
                name="militaryService"
                value={formData.militaryService}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition bg-white text-right"
              >
                <option value="">اختر...</option>
                <option value="yes">مؤدي</option>
                <option value="no">غير مؤدي</option>
                <option value="exempt">معفى</option>
              </select>
            </div>

            <div>
              <label htmlFor="previousJobs" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 ml-2" />
                الوظائف السابقة
              </label>
              <textarea
                id="previousJobs"
                name="previousJobs"
                value={formData.previousJobs}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition text-right resize-none"
                placeholder="اذكر خبراتك الوظيفية السابقة (اسم الشركة، المسمى الوظيفي، المدة)"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 ml-2" />
            ملاحظات أخرى
          </h2>

          <div>
            <label htmlFor="remarks" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 ml-2" />
              ملاحظات إضافية
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition text-right resize-none"
              placeholder="أي معلومات إضافية تود إضافتها..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-base sm:text-lg hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-300 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال المعلومات'}
        </button>
      </form>
    </div>
  );
}
