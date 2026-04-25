export default function ProspectModal ({ prospect, onClose }: any) {
    return (
        <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2px] shadow-xl w-[420px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-semibold text-gray-800 text-base">
              Prospect Details
            </h2>
            
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">First Name</h3>
            <p className="text-sm text-gray-500 mt-1">{prospect.firstName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">LastName</h3>
            <p className="text-sm text-gray-500 mt-1">{prospect.lastName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Email</h3>
            <p className="text-sm text-gray-500 mt-1">{prospect.email}</p>
          </div>
          {/* <div>
            <h3 className="font-semibold text-gray-800 text-sm">Name</h3>
            <p className="text-sm text-gray-500 mt-1">{prospect.name}</p>
          </div> */}

          
        </div>
      </div>
    </div>
    )
}