import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import toast from "react-hot-toast";
import { Copy } from "lucide-react";

const LoginPage = () => {
  const sampleAccounts = [
    {
      fullName: "Nguyen Van An",
      username: "nguyenvanan",
      email: "nguyenvanan@example.com",
      password: "123456",
    },
    {
      fullName: "Tran Thi Mai",
      username: "tranthimai",
      email: "tranthimai@example.com",
      password: "123456",
    },
    {
      fullName: "Le Minh Khoa",
      username: "leminhkhoa",
      email: "leminhkhoa@example.com",
      password: "123456",
    },
    {
      fullName: "Pham Quang Huy",
      username: "phamquanghuy",
      email: "phamquanghuy@example.com",
      password: "123456",
    },
    {
      fullName: "Hoang Thi Lan",
      username: "hoangthilan",
      email: "hoangthilan@example.com",
      password: "123456",
    },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Đã sao chép!"))
      .catch(() => toast.error("Sao chép thất bại"));
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-36 w-auto flex items-center justify-center gap-2 cursor-pointer pointer-events-none select-none">
          <img
            className="h-16 w-auto"
            src="/gettech.webp"
            alt="Connectly Logo"
          />
          <span className="text-3xl font-extrabold text-[#1548a0]">
            Connectly
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to Connectly?
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50"
              >
                Join now
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sample Accounts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Password
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sampleAccounts.map((account, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{account.username}</span>
                          <button
                            onClick={() => copyToClipboard(account.email)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Sao chép Email"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{account.password}</span>
                          <button
                            onClick={() => copyToClipboard(account.password)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Sao chép Mật khẩu"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
