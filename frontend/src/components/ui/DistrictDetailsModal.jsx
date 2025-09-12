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
                    {districtData.statistics?.total_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Granted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    {districtData.statistics?.granted_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-yellow-600">
                    {districtData.statistics?.pending_claims || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    {districtData.statistics?.rejected_claims || 0}
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
                      {districtData.statistics?.ifr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">IFR Claims</div>
                    <Badge className="bg-blue-100 text-blue-800 mt-1">
                      {calculatePercentage(districtData.statistics?.ifr_claims, districtData.statistics?.total_claims)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {districtData.statistics?.cr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">CR Claims</div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      {calculatePercentage(districtData.statistics?.cr_claims, districtData.statistics?.total_claims)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {districtData.statistics?.cfr_claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">CFR Claims</div>
                    <Badge className="bg-orange-100 text-orange-800 mt-1">
                      {calculatePercentage(districtData.statistics?.cfr_claims, districtData.statistics?.total_claims)}%
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
                      <span>{calculatePercentage(districtData.statistics?.granted_claims, districtData.statistics?.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.statistics?.granted_claims, districtData.statistics?.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pending Claims</span>
                      <span>{calculatePercentage(districtData.statistics?.pending_claims, districtData.statistics?.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-yellow-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.statistics?.pending_claims, districtData.statistics?.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Rejected Claims</span>
                      <span>{calculatePercentage(districtData.statistics?.rejected_claims, districtData.statistics?.total_claims)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${calculatePercentage(districtData.statistics?.rejected_claims, districtData.statistics?.total_claims)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patta Holders List */}
            {districtData.pattaHolders && districtData.pattaHolders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patta Holders ({districtData.pattaHolders.length})</CardTitle>
                  <p className="text-sm text-gray-600">Verified patta holders with granted forest rights</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patta Holder
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Village
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Claim Info
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {districtData.pattaHolders.slice(0, 20).map((holder, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {holder.holder_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  S/o {holder.father_husband_name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Patta: {holder.patta_number}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">
                                <div>{holder.age} years, {holder.gender}</div>
                                <div className="text-xs text-gray-500">{holder.occupation}</div>
                                <div className="text-xs text-gray-500">Family: {holder.family_size} members</div>
                                <div className="text-xs text-gray-500">Income: ₹{holder.annual_income ? holder.annual_income.toLocaleString() : 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {holder.village_name}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">
                                <div>Type: {holder.claim_type}</div>
                                <div>Area: {holder.area_claimed} ha</div>
                                <div className="text-xs text-gray-500">{holder.land_classification}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={
                                holder.verification_status === 'Verified' 
                                  ? 'bg-green-100 text-green-800'
                                  : holder.verification_status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }>
                                {holder.verification_status}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {holder.issue_date ? new Date(holder.issue_date).toLocaleDateString() : 'No date'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {districtData.pattaHolders.length > 20 && (
                      <div className="px-4 py-3 bg-gray-50 text-center">
                        <p className="text-sm text-gray-600">
                          Showing 20 of {districtData.pattaHolders.length} patta holders
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      calculatePercentage(districtData.statistics?.granted_claims, districtData.statistics?.total_claims) > 70 
                        ? 'text-green-600' 
                        : calculatePercentage(districtData.statistics?.granted_claims, districtData.statistics?.total_claims) > 40
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {calculatePercentage(districtData.statistics?.granted_claims, districtData.statistics?.total_claims)}%
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Total Area Granted</h4>
                    <div className="text-lg font-bold text-blue-600">
                      {parseFloat(districtData.statistics?.total_granted_area || 0).toFixed(1)} hectares
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