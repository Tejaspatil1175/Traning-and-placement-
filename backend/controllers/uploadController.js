const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.uploadMiddleware = upload.single('file');

exports.uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty'
      });
    }

    const students = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const studentData = {
          name: row.Name || row.name,
          email: row.Email || row.email,
          phone: row.Phone || row.phone,
          rollNo: row['Roll No'] || row.rollNo || row.RollNo,
          branch: row.Branch || row.branch,
          cgpa: parseFloat(row.CGPA || row.cgpa),
          backlogs: parseInt(row.Backlogs || row.backlogs || 0),
          passingYear: parseInt(row['Passing Year'] || row.passingYear || row.PassingYear),
          skills: typeof (row.Skills || row.skills) === 'string' 
            ? (row.Skills || row.skills).split(',').map(s => s.trim())
            : [],
          resumeLink: row['Resume Link'] || row.resumeLink || row.ResumeLink || '',
          placed: (row.Placed || row.placed) === 'TRUE' || (row.Placed || row.placed) === true
        };

        if (!studentData.name || !studentData.email || !studentData.rollNo || 
            !studentData.branch || isNaN(studentData.cgpa) || isNaN(studentData.passingYear)) {
          errors.push({
            row: i + 2,
            error: 'Missing required fields',
            data: row
          });
          continue;
        }

        students.push(studentData);
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
      }
    }

    if (students.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'No valid student data found in the file',
        errors
      });
    }

    const insertedStudents = [];
    const duplicateErrors = [];

    for (const studentData of students) {
      try {
        const student = await Student.create(studentData);
        insertedStudents.push(student);
      } catch (error) {
        if (error.code === 11000) {
          duplicateErrors.push({
            rollNo: studentData.rollNo,
            email: studentData.email,
            error: 'Duplicate entry'
          });
        } else {
          duplicateErrors.push({
            rollNo: studentData.rollNo,
            error: error.message
          });
        }
      }
    }

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${insertedStudents.length} students`,
      data: {
        inserted: insertedStudents.length,
        failed: errors.length + duplicateErrors.length,
        total: data.length
      },
      errors: [...errors, ...duplicateErrors]
    });
  } catch (error) {
    console.error('Upload students error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during upload',
      error: error.message
    });
  }
};

exports.downloadTemplate = (req, res) => {
  try {
    const templateData = [
      {
        Name: 'John Doe',
        Email: 'john@example.com',
        Phone: '9876543210',
        'Roll No': 'CS001',
        Branch: 'Computer Science',
        CGPA: 8.5,
        Backlogs: 0,
        'Passing Year': 2025,
        Skills: 'JavaScript,React,Node.js',
        'Resume Link': 'https://example.com/resume.pdf',
        Placed: 'FALSE'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=student_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.exportStudents = async (req, res) => {
  try {
    const { ids } = req.body;
    
    let query = {};
    if (ids && ids.length > 0) {
      query._id = { $in: ids };
    }

    const students = await Student.find(query)
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found'
      });
    }

    const exportData = students.map(student => ({
      Name: student.name,
      Email: student.email,
      Phone: student.phone,
      'Roll No': student.rollNo,
      Branch: student.branch,
      CGPA: student.cgpa,
      Backlogs: student.backlogs,
      'Passing Year': student.passingYear,
      Skills: student.skills.join(', '),
      'Resume Link': student.resumeLink,
      Placed: student.placed ? 'TRUE' : 'FALSE',
      'Placed Company': student.placedCompany || '',
      Package: student.package || ''
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=students_export_${Date.now()}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
