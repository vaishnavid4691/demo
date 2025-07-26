import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Store, Truck, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { t } = useLanguage();
  const { userProfile, updateUserProfile, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || currentUser?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    userType: userProfile?.userType || 'vendor'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || currentUser?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      userType: userProfile?.userType || 'vendor'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || currentUser?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      userType: userProfile?.userType || 'vendor'
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Please Login</h2>
        <p className="text-gray-600">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-600 text-white p-4 rounded-full">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'vendor' })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.userType === 'vendor'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Vendor</div>
                  <div className="text-xs text-gray-500">Street food vendor</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'supplier' })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.userType === 'supplier'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Supplier</div>
                  <div className="text-xs text-gray-500">Raw material supplier</div>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                {userProfile?.userType === 'supplier' ? (
                  <Truck className="h-6 w-6 text-primary-600" />
                ) : (
                  <Store className="h-6 w-6 text-primary-600" />
                )}
                <div>
                  <span className="font-medium capitalize">{userProfile?.userType || 'vendor'}</span>
                  <p className="text-sm text-gray-600">
                    {userProfile?.userType === 'supplier' ? 'Raw material supplier' : 'Street food vendor'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-800">{userProfile?.name || 'Not provided'}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-800">{currentUser?.email || 'Not provided'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-800">{userProfile?.phone || 'Not provided'}</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            {isEditing ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field pl-10 resize-none"
                  rows="3"
                  placeholder="Enter your address"
                />
              </div>
            ) : (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <span className="text-gray-800">{userProfile?.address || 'Not provided'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-primary-700">Member Since</div>
          </div>

          <div className="text-center p-4 bg-success-50 rounded-lg">
            <div className="text-2xl font-bold text-success-600">
              {userProfile?.userType === 'supplier' ? '25' : '12'}
            </div>
            <div className="text-sm text-success-700">
              {userProfile?.userType === 'supplier' ? 'Products Listed' : 'Orders Placed'}
            </div>
          </div>

          <div className="text-center p-4 bg-warning-50 rounded-lg">
            <div className="text-2xl font-bold text-warning-600">4.8</div>
            <div className="text-sm text-warning-700">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications about orders and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">SMS Notifications</h3>
              <p className="text-sm text-gray-600">Receive SMS updates for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Marketing Communications</h3>
              <p className="text-sm text-gray-600">Receive promotional offers and product updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Actions</h2>
        
        <div className="space-y-4">
          <button className="w-full md:w-auto bg-warning-600 text-white px-6 py-3 rounded-lg hover:bg-warning-700 transition-colors">
            Change Password
          </button>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <h3 className="font-medium text-danger-800 mb-2">Delete Account</h3>
              <p className="text-sm text-danger-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="bg-danger-600 text-white px-4 py-2 rounded-lg hover:bg-danger-700 transition-colors text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;