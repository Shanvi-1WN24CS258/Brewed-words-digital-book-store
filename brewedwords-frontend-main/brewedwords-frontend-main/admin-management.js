// admin-management.js - Admin user management

const AdminManager = {
    // Initialize admin system
    init: function() {
        if (!localStorage.getItem('adminUsers')) {
            this.createDefaultAdmin();
        }
        this.checkSession();
    },
    
    // Create default admin account
    createDefaultAdmin: function() {
        const defaultAdmin = {
            id: 1,
            email: "admin@brewedwords.com",
            password: this.hashPassword("Admin@123"), // Hashed password
            name: "System Administrator",
            role: "super_admin",
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            permissions: ['all'] // All permissions
        };
        
        const adminUsers = [defaultAdmin];
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        console.log('Default admin account created');
    },
    
    // Simple password hash (for demo - use bcrypt in production)
    hashPassword: function(password) {
        return btoa(password + 'SALT123'); // Base64 encoding with salt
    },
    
    // Verify password
    verifyPassword: function(inputPassword, storedHash) {
        const inputHash = this.hashPassword(inputPassword);
        return inputHash === storedHash;
    },
    
    // Admin login
    login: function(email, password) {
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const admin = adminUsers.find(a => a.email === email && a.isActive);
        
        if (!admin) {
            return { success: false, message: 'Admin not found' };
        }
        
        if (!this.verifyPassword(password, admin.password)) {
            return { success: false, message: 'Invalid password' };
        }
        
        // Update last login
        admin.lastLogin = new Date().toISOString();
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        // Create session
        const session = {
            adminId: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
            loginTime: new Date().toISOString(),
            expiry: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        };
        
        localStorage.setItem('adminSession', JSON.stringify(session));
        
        return { 
            success: true, 
            message: 'Login successful',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
    },
    
    // Check if admin is logged in
    checkSession: function() {
        const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
        
        if (!session) {
            return false;
        }
        
        // Check if session expired
        if (Date.now() > session.expiry) {
            this.logout();
            return false;
        }
        
        return true;
    },
    
    // Get current admin
    getCurrentAdmin: function() {
        if (!this.checkSession()) {
            return null;
        }
        
        return JSON.parse(localStorage.getItem('adminSession'));
    },
    
    // Admin logout
    logout: function() {
        localStorage.removeItem('adminSession');
        return { success: true, message: 'Logged out successfully' };
    },
    
    // Add new admin (only super_admin can do this)
    addAdmin: function(newAdminData, currentAdmin) {
        if (currentAdmin.role !== 'super_admin') {
            return { success: false, message: 'Permission denied' };
        }
        
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        
        // Check if email already exists
        if (adminUsers.some(a => a.email === newAdminData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        const newAdmin = {
            id: adminUsers.length > 0 ? Math.max(...adminUsers.map(a => a.id)) + 1 : 1,
            email: newAdminData.email,
            password: this.hashPassword(newAdminData.password),
            name: newAdminData.name,
            role: newAdminData.role || 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            permissions: newAdminData.permissions || ['view', 'edit', 'delete']
        };
        
        adminUsers.push(newAdmin);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        return { 
            success: true, 
            message: 'Admin added successfully',
            admin: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        };
    },
    
    // List all admins
    listAdmins: function(currentAdmin) {
        if (currentAdmin.role !== 'super_admin') {
            return { success: false, message: 'Permission denied' };
        }
        
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        
        // Remove passwords from response
        const safeAdmins = adminUsers.map(admin => ({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            createdAt: admin.createdAt,
            lastLogin: admin.lastLogin,
            isActive: admin.isActive,
            permissions: admin.permissions
        }));
        
        return { success: true, admins: safeAdmins };
    },
    
    // Change admin password
    changePassword: function(adminId, oldPassword, newPassword, currentAdmin) {
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const adminIndex = adminUsers.findIndex(a => a.id === adminId);
        
        if (adminIndex === -1) {
            return { success: false, message: 'Admin not found' };
        }
        
        // Check permission: admin can change own password, super_admin can change any
        if (currentAdmin.adminId !== adminId && currentAdmin.role !== 'super_admin') {
            return { success: false, message: 'Permission denied' };
        }
        
        // Verify old password
        if (!this.verifyPassword(oldPassword, adminUsers[adminIndex].password)) {
            return { success: false, message: 'Old password incorrect' };
        }
        
        // Update password
        adminUsers[adminIndex].password = this.hashPassword(newPassword);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        return { success: true, message: 'Password changed successfully' };
    }
};

// Make it globally available
window.AdminManager = AdminManager;