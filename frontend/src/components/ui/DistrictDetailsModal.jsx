import React from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const DistrictDetailsModal = ({ 
  isOpen, 
  onClose, 
  district, 
  districtData,
  loading 
}) => {
  if (!district) return null;

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {district.district} District Details
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive FRA implementation status and statistics
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : districtData ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {districtData.total_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Granted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    {districtData.granted_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-yellow-600">
                    {districtData.pending_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    {districtData.rejected_claims || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Claim Types */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {districtData.ifr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">IFR Claims</div>
                    <Badge className="bg-blue-100 text-blue-800 mt-1">
                      {calculatePercentage(districtData.ifr_claims, districtData.total_claims)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {districtData.cr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">CR Claims</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      {calculatePercentage(districtData.cr_claims, districtData.total_claims)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {districtData.cfr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">CFR Claims</div>
                    <Badge className="bg-orange-100 text-orange-800 mt-1">
                      {calculatePercentage(districtData.cfr_claims, districtData.total_claims)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Granted Claims</span>
                      <span>{calculatePercentage(districtData.granted_claims, districtData.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.granted_claims, districtData.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pending Claims</span>
                      <span>{calculatePercentage(districtData.pending_claims, districtData.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-yellow-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.pending_claims, districtData.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Rejected Claims</span>
                      <span>{calculatePercentage(districtData.rejected_claims, districtData.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.rejected_claims, districtData.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Success Rate</h4>
                    <div className={`text-lg font-bold ${
                      calculatePercentage(districtData.granted_claims, districtData.total_claims) > 70 
                        ? 'text-green-600' 
                        : calculatePercentage(districtData.granted_claims, districtData.total_claims) > 40
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {calculatePercentage(districtData.granted_claims, districtData.total_claims)}%
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Total Area Granted</h4>
                    <div className="text-lg font-bold text-blue-600">
                      {parseFloat(districtData.total_granted_area || 0).toFixed(1)} hectares
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No detailed data available for this district.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DistrictDetailsModal;