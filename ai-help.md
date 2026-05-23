{
"openapi": "3.1.0",
"info": {
"title": "HQLCSDL API",
"description": "API hệ quản lý cơ sở dữ liệu — Đồ án môn học",
"version": "1.0.0"
},
"servers": [
{
"url": "http://192.168.1.164:8080",
"description": "Generated server url"
}
],
"security": [
{
"Bearer Authentication": []
}
],
"tags": [
{
"name": "Tồn kho",
"description": "Các API quản lý tồn kho theo cửa hàng và biến thể sản phẩm"
},
{
"name": "Upload",
"description": "Upload ảnh lên Cloudinary"
},
{
"name": "Biến thể sản phẩm (Admin)",
"description": "Các API quản lý biến thể sản phẩm dành cho Admin/Quản lý"
},
{
"name": "Sản phẩm (Admin)",
"description": "Các API quản lý sản phẩm dành cho Admin/Quản lý"
},
{
"name": "Khách hàng",
"description": "Các API quản lý thông tin khách hàng"
},
{
"name": "Xác thực",
"description": "Các API quản lý đăng nhập, cấp lại token và thông tin cá nhân"
},
{
"name": "Danh mục sản phẩm",
"description": "Các API lấy thông tin danh mục sản phẩm"
},
{
"name": "Nhà cung cấp",
"description": "Các API quản lý thông tin nhà cung cấp"
},
{
"name": "Cửa hàng",
"description": "Các API quản lý thông tin cửa hàng"
},
{
"name": "Nhân viên",
"description": "Các API quản lý nhân viên và tài khoản"
}
],
"paths": {
"/ton-kho": {
"put": {
"tags": [
"Tồn kho"
],
"summary": "Cập nhật tồn kho",
"description": "Đặt số lượng tồn kho cho một biến thể tại một cửa hàng cụ thể (sẽ tự tạo bản ghi nếu chưa tồn tại)",
"operationId": "updateTonKho",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TonKhoUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/nhan-vien/{manv}": {
"get": {
"tags": [
"Nhân viên"
],
"summary": "Lấy chi tiết nhân viên",
"description": "Lấy thông tin chi tiết nhân viên theo mã nhân viên",
"operationId": "getNhanVienById",
"parameters": [
{
"name": "manv",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseNhanVienResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Nhân viên"
        ],
        "summary": "Cập nhật nhân viên",
        "description": "Cập nhật thông tin nhân viên theo mã nhân viên",
        "operationId": "updateNhanVien",
        "parameters": [
          {
            "name": "manv",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NhanVienUpdateRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Nhân viên"
        ],
        "summary": "Vô hiệu hóa nhân viên",
        "description": "Chuyển trạng thái tài khoản của nhân viên thành khóa cứng",
        "operationId": "disableNhanVien",
        "parameters": [
          {
            "name": "manv",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/nhan-vien/{manv}/tai-khoan/trang-thai": {
"put": {
"tags": [
"Nhân viên"
],
"summary": "Cập nhật trạng thái tài khoản",
"description": "Cập nhật trạng thái của tài khoản (HoatDong, KhoaCung, KhoaTam)",
"operationId": "updateStatus",
"parameters": [
{
"name": "manv",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"type": "object",
"additionalProperties": {
"type": "string"
}
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/nhan-vien/{manv}/tai-khoan/role": {
      "put": {
        "tags": [
          "Nhân viên"
        ],
        "summary": "Cập nhật quyền",
        "description": "Thay đổi nhóm quyền cho tài khoản nhân viên",
        "operationId": "updateRole",
        "parameters": [
          {
            "name": "manv",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": {
                  "type": "string"
                }
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/nhacungcap/{id}": {
"get": {
"tags": [
"Nhà cung cấp"
],
"summary": "Lấy chi tiết nhà cung cấp",
"description": "Lấy thông tin chi tiết nhà cung cấp theo ID",
"operationId": "getNhaCungCapById",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseNhaCungCap"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Nhà cung cấp"
        ],
        "summary": "Cập nhật nhà cung cấp",
        "description": "Cập nhật thông tin của nhà cung cấp theo ID",
        "operationId": "updateNhaCungCap",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NhaCungCapRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Nhà cung cấp"
        ],
        "summary": "Xóa nhà cung cấp",
        "description": "Xóa nhà cung cấp khỏi hệ thống theo ID",
        "operationId": "deleteNhaCungCap",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/khachhang/{id}": {
"get": {
"tags": [
"Khách hàng"
],
"summary": "Lấy chi tiết khách hàng",
"description": "Lấy thông tin chi tiết khách hàng theo ID",
"operationId": "getKhachHangById",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseKhachHang"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Khách hàng"
        ],
        "summary": "Cập nhật khách hàng",
        "description": "Cập nhật thông tin của khách hàng theo ID",
        "operationId": "updateKhachHang",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/KhachHangRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Khách hàng"
        ],
        "summary": "Xóa khách hàng",
        "description": "Xóa khách hàng khỏi hệ thống theo ID",
        "operationId": "deleteKhachHang",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/cuahang/{id}": {
"get": {
"tags": [
"Cửa hàng"
],
"summary": "Lấy chi tiết cửa hàng",
"description": "Lấy thông tin chi tiết cửa hàng theo ID",
"operationId": "getCuaHangById",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseCuaHang"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Cửa hàng"
        ],
        "summary": "Cập nhật cửa hàng",
        "description": "Cập nhật thông tin của cửa hàng theo ID",
        "operationId": "updateCuaHang",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CuaHangRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Cửa hàng"
        ],
        "summary": "Xóa cửa hàng",
        "description": "Xóa cửa hàng khỏi hệ thống theo ID",
        "operationId": "deleteCuaHang",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/admin/san-pham/{maSp}": {
"get": {
"tags": [
"Sản phẩm (Admin)"
],
"summary": "Lấy chi tiết sản phẩm",
"description": "Lấy thông tin chi tiết của một sản phẩm kèm theo các biến thể",
"operationId": "getDetail",
"parameters": [
{
"name": "maSp",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseSanPhamResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Sản phẩm (Admin)"
        ],
        "summary": "Cập nhật sản phẩm",
        "description": "Cập nhật thông tin sản phẩm bằng cách gọi Stored Procedure UPDATE_SANPHAM",
        "operationId": "update",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SanPhamRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Sản phẩm (Admin)"
        ],
        "summary": "Xóa sản phẩm",
        "description": "Xóa cứng sản phẩm bằng cách gọi Stored Procedure DELETE_SANPHAM (chỉ khi chưa có biến thể)",
        "operationId": "delete",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/admin/san-pham/{maSp}/bien-the/{maBt}": {
"get": {
"tags": [
"Biến thể sản phẩm (Admin)"
],
"summary": "Lấy chi tiết biến thể",
"description": "Lấy thông tin chi tiết của một biến thể theo mã biến thể",
"operationId": "getDetail_1",
"parameters": [
{
"name": "maSp",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
},
{
"name": "maBt",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseBienTheResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Biến thể sản phẩm (Admin)"
        ],
        "summary": "Cập nhật biến thể",
        "description": "Cập nhật thông tin biến thể bằng cách gọi Stored Procedure UPDATE_BIENTHE",
        "operationId": "update_1",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "maBt",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BienTheRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Biến thể sản phẩm (Admin)"
        ],
        "summary": "Xóa biến thể",
        "description": "Xóa cứng biến thể bằng cách gọi Stored Procedure DELETE_BIENTHE (chỉ khi không có ràng buộc dữ liệu)",
        "operationId": "delete_1",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "maBt",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/upload/image": {
"post": {
"tags": [
"Upload"
],
"summary": "Upload ảnh sản phẩm",
"description": "Upload file ảnh (JPEG/PNG/WebP, tối đa 5MB) lên Cloudinary",
"operationId": "uploadImage",
"requestBody": {
"content": {
"multipart/form-data": {
"schema": {
"type": "object",
"properties": {
"file": {
"type": "string",
"format": "binary"
}
},
"required": [
"file"
]
}
}
}
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseUploadImageResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Upload"
        ],
        "summary": "Xóa ảnh trên Cloudinary",
        "description": "Xóa theo publicId trả về từ API upload",
        "operationId": "deleteImage",
        "parameters": [
          {
            "name": "publicId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/nhan-vien": {
"get": {
"tags": [
"Nhân viên"
],
"summary": "Lấy tất cả nhân viên",
"description": "Lấy danh sách nhân viên có phân trang và filter",
"operationId": "getAllNhanVien",
"parameters": [
{
"name": "mach",
"in": "query",
"required": false,
"schema": {
"type": "integer",
"format": "int64"
}
},
{
"name": "chucvu",
"in": "query",
"required": false,
"schema": {
"type": "string"
}
},
{
"name": "trangthai",
"in": "query",
"required": false,
"schema": {
"type": "string"
}
},
{
"name": "search",
"in": "query",
"required": false,
"schema": {
"type": "string"
}
},
{
"name": "pageable",
"in": "query",
"required": true,
"schema": {
"$ref": "#/components/schemas/Pageable"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponsePageResponseNhanVienResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Nhân viên"
        ],
        "summary": "Thêm nhân viên",
        "description": "Thêm nhân viên mới và tự động tạo tài khoản tương ứng",
        "operationId": "createNhanVien",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NhanVienRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/nhacungcap": {
      "get": {
        "tags": [
          "Nhà cung cấp"
        ],
        "summary": "Lấy tất cả nhà cung cấp",
        "description": "Lấy danh sách tất cả các nhà cung cấp",
        "operationId": "getAllNhaCungCap",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListNhaCungCap"
}
}
}
}
}
},
"post": {
"tags": [
"Nhà cung cấp"
],
"summary": "Thêm nhà cung cấp",
"description": "Thêm một nhà cung cấp mới vào hệ thống",
"operationId": "createNhaCungCap",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/NhaCungCapRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/khachhang": {
"get": {
"tags": [
"Khách hàng"
],
"summary": "Lấy tất cả khách hàng",
"description": "Lấy danh sách khách hàng có phân trang và tìm kiếm",
"operationId": "getAllKhachHang",
"parameters": [
{
"name": "search",
"in": "query",
"required": false,
"schema": {
"type": "string"
}
},
{
"name": "page",
"in": "query",
"description": "Zero-based page index (0..N)",
"required": false,
"schema": {
"type": "integer",
"default": 0,
"minimum": 0
}
},
{
"name": "size",
"in": "query",
"description": "The size of the page to be returned",
"required": false,
"schema": {
"type": "integer",
"default": 20,
"minimum": 1
}
},
{
"name": "sort",
"in": "query",
"description": "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
"required": false,
"schema": {
"type": "array",
"items": {
"type": "string"
}
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponsePageResponseKhachHang"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Khách hàng"
        ],
        "summary": "Thêm khách hàng",
        "description": "Thêm một khách hàng mới vào hệ thống",
        "operationId": "createKhachHang",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/KhachHangRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/cuahang": {
      "get": {
        "tags": [
          "Cửa hàng"
        ],
        "summary": "Lấy tất cả cửa hàng",
        "description": "Lấy danh sách tất cả các cửa hàng",
        "operationId": "getAllCuaHang",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListCuaHang"
}
}
}
}
}
},
"post": {
"tags": [
"Cửa hàng"
],
"summary": "Thêm cửa hàng",
"description": "Thêm một cửa hàng mới vào hệ thống",
"operationId": "createCuaHang",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CuaHangRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/auth/reset-password": {
"post": {
"tags": [
"Xác thực"
],
"summary": "Đổi mật khẩu",
"description": "Đổi mật khẩu của người dùng đang đăng nhập",
"operationId": "resetPassword",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ResetPasswordRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/auth/refresh": {
"post": {
"tags": [
"Xác thực"
],
"summary": "Làm mới Token",
"description": "Dùng Refresh Token để lấy Access Token mới",
"operationId": "refresh",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/RefreshTokenRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMapStringString"
}
}
}
}
}
}
},
"/auth/logout": {
"post": {
"tags": [
"Xác thực"
],
"summary": "Đăng xuất",
"description": "Đăng xuất khỏi hệ thống (Chủ yếu gọi để xoá ở client)",
"operationId": "logout",
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "tags": [
          "Xác thực"
        ],
        "summary": "Đăng nhập",
        "description": "Xác thực và trả về Access Token, Refresh Token",
        "operationId": "login",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseLoginResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/phieu-nhap": {
      "get": {
        "tags": [
          "phieu-nhap-controller"
        ],
        "operationId": "getAllPhieuNhap",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "size",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePageResponsePhieuNhapResponse"
}
}
}
}
}
},
"post": {
"tags": [
"phieu-nhap-controller"
],
"operationId": "createPhieuNhap",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/PhieuNhapRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseVoid"
}
}
}
}
}
}
},
"/api/phieu-nhap/{maPn}/cancel": {
"post": {
"tags": [
"phieu-nhap-controller"
],
"operationId": "cancelPhieuNhap",
"parameters": [
{
"name": "maPn",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseVoid"
                }
              }
            }
          }
        }
      }
    },
    "/admin/san-pham": {
      "get": {
        "tags": [
          "Sản phẩm (Admin)"
        ],
        "summary": "Tìm kiếm sản phẩm",
        "description": "Tìm kiếm sản phẩm có phân trang và lọc theo danh mục, trạng thái, từ khóa",
        "operationId": "search",
        "parameters": [
          {
            "name": "maDm",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "trangThai",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "Zero-based page index (0..N)",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 0,
              "minimum": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "description": "The size of the page to be returned",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 20,
              "minimum": 1
            }
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
            "required": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePageResponseSanPhamResponse"
}
}
}
}
}
},
"post": {
"tags": [
"Sản phẩm (Admin)"
],
"summary": "Thêm sản phẩm mới",
"description": "Tạo một sản phẩm mới kèm theo danh sách biến thể trong cùng một transaction",
"operationId": "create",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/SanPhamRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/admin/san-pham/{maSp}/bien-the": {
"get": {
"tags": [
"Biến thể sản phẩm (Admin)"
],
"summary": "Lấy danh sách biến thể",
"description": "Lấy toàn bộ biến thể của một sản phẩm cụ thể",
"operationId": "getListByProduct",
"parameters": [
{
"name": "maSp",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int64"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseListBienTheResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Biến thể sản phẩm (Admin)"
        ],
        "summary": "Thêm biến thể mới",
        "description": "Tạo một biến thể mới cho sản phẩm bằng cách gọi Stored Procedure INSERT_BIENTHE",
        "operationId": "create_1",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BienTheRequest"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "OK",
"content": {
"_/_": {
"schema": {
"$ref": "#/components/schemas/ApiResponseMessageResponse"
}
}
}
}
}
}
},
"/ton-kho/dieu-chinh": {
"patch": {
"tags": [
"Tồn kho"
],
"summary": "Điều chỉnh tồn kho",
"description": "Tăng hoặc giảm số lượng tồn kho. Truyền soLuong dương để tăng, âm để giảm",
"operationId": "adjustTonKho",
"requestBody": {
"content": {
"application/json": {
"schema": {
"type": "object",
"additionalProperties": {

                }
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/nhacungcap/{id}/status": {
      "patch": {
        "tags": [
          "Nhà cung cấp"
        ],
        "summary": "Thay đổi trạng thái nhà cung cấp",
        "description": "Thay đổi trạng thái hoạt động của nhà cung cấp",
        "operationId": "changeStatus",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": {
                  "type": "string"
                }
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/cuahang/{id}/status": {
      "patch": {
        "tags": [
          "Cửa hàng"
        ],
        "summary": "Thay đổi trạng thái cửa hàng",
        "description": "Thay đổi trạng thái hoạt động của cửa hàng",
        "operationId": "changeStatus_1",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": {
                  "type": "string"
                }
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/admin/san-pham/{maSp}/trang-thai": {
      "patch": {
        "tags": [
          "Sản phẩm (Admin)"
        ],
        "summary": "Đổi trạng thái sản phẩm",
        "description": "Thay đổi trạng thái sản phẩm (DangBan, NgungBan, HetHang) bằng cách gọi Stored Procedure CHANGE_STATUS_SANPHAM",
        "operationId": "changeStatus_2",
        "parameters": [
          {
            "name": "maSp",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "trangThai",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMessageResponse"
                }
              }
            }
          }
        }
      }
    },
    "/ton-kho/tong-quan": {
      "get": {
        "tags": [
          "Tồn kho"
        ],
        "summary": "Tổng quan tồn kho (Admin)",
        "description": "Lấy danh sách tồn kho theo biến thể, số lượng là tổng trên tất cả cửa hàng. Hỗ trợ tìm kiếm và phân trang",
        "operationId": "getTonKhoTongQuan",
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "maSp",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "Zero-based page index (0..N)",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 0,
              "minimum": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "description": "The size of the page to be returned",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 20,
              "minimum": 1
            }
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
            "required": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePageResponseTonKhoTongQuanResponse"
                }
              }
            }
          }
        }
      }
    },
    "/ton-kho/cua-hang/{maCh}": {
      "get": {
        "tags": [
          "Tồn kho"
        ],
        "summary": "Lấy tồn kho theo cửa hàng",
        "description": "Lấy danh sách tồn kho của một cửa hàng, hỗ trợ tìm kiếm theo tên sản phẩm/SKU/barcode, lọc theo mã sản phẩm (maSp) và phân trang",
        "operationId": "getTonKhoByCuaHang",
        "parameters": [
          {
            "name": "maCh",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "maSp",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "Zero-based page index (0..N)",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 0,
              "minimum": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "description": "The size of the page to be returned",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 20,
              "minimum": 1
            }
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
            "required": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePageResponseTonKhoResponse"
                }
              }
            }
          }
        }
      }
    },
    "/ton-kho/canh-bao": {
      "get": {
        "tags": [
          "Tồn kho"
        ],
        "summary": "Cảnh báo tồn kho thấp",
        "description": "Lấy danh sách các mặt hàng có số lượng tồn kho dưới ngưỡng cho trước (mặc định: 10)",
        "operationId": "getCanhBaoTonKho",
        "parameters": [
          {
            "name": "maCh",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "threshold",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "Zero-based page index (0..N)",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 0,
              "minimum": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "description": "The size of the page to be returned",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 20,
              "minimum": 1
            }
          },
          {
            "name": "sort",
            "in": "query",
            "description": "Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
            "required": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePageResponseTonKhoResponse"
                }
              }
            }
          }
        }
      }
    },
    "/ton-kho/bien-the/{maBienThe}": {
      "get": {
        "tags": [
          "Tồn kho"
        ],
        "summary": "Lấy tồn kho theo biến thể",
        "description": "Lấy tổng hợp tồn kho của một biến thể trên tất cả các cửa hàng, bao gồm chi tiết từng cửa hàng",
        "operationId": "getTonKhoByBienThe",
        "parameters": [
          {
            "name": "maBienThe",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseTonKhoTongHopResponse"
                }
              }
            }
          }
        }
      }
    },
    "/danhmuc": {
      "get": {
        "tags": [
          "Danh mục sản phẩm"
        ],
        "summary": "Lấy tất cả danh mục",
        "description": "Lấy danh sách tất cả các danh mục sản phẩm",
        "operationId": "getAllCategories",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListDanhMucResponse"
                }
              }
            }
          }
        }
      }
    },
    "/danhmuc/cay": {
      "get": {
        "tags": [
          "Danh mục sản phẩm"
        ],
        "summary": "Lấy danh mục dạng cây",
        "description": "Lấy danh sách danh mục sản phẩm phân cấp cha - con",
        "operationId": "getCategoryTree",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListDanhMucResponse"
                }
              }
            }
          }
        }
      }
    },
    "/auth/me": {
      "get": {
        "tags": [
          "Xác thực"
        ],
        "summary": "Lấy thông tin cá nhân",
        "description": "Lấy thông tin của người dùng đang đăng nhập (từ Token)",
        "operationId": "getMe",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMeResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/phieu-nhap/{maPn}": {
      "get": {
        "tags": [
          "phieu-nhap-controller"
        ],
        "operationId": "getPhieuNhapById",
        "parameters": [
          {
            "name": "maPn",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePhieuNhapResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/phieu-nhap/{maPn}/chi-tiet": {
      "get": {
        "tags": [
          "phieu-nhap-controller"
        ],
        "operationId": "getChiTietPhieuNhap",
        "parameters": [
          {
            "name": "maPn",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListChiTietPhieuNhapResponse"
                }
              }
            }
          }
        }
      }
    }

},
"components": {
"schemas": {
"TonKhoUpdateRequest": {
"type": "object",
"description": "Yêu cầu cập nhật tồn kho",
"properties": {
"maCh": {
"type": "integer",
"format": "int64",
"description": "Mã cửa hàng",
"example": 1
},
"maBienThe": {
"type": "integer",
"format": "int64",
"description": "Mã biến thể",
"example": 1
},
"soLuong": {
"type": "integer",
"format": "int32",
"description": "Số lượng tồn kho mới",
"example": 50,
"minimum": 0
}
},
"required": [
"maBienThe",
"maCh",
"soLuong"
]
},
"ApiResponseMessageResponse": {
"type": "object",
"properties": {
"data": {
"$ref": "#/components/schemas/MessageResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "MessageResponse": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          }
        }
      },
      "NhanVienUpdateRequest": {
        "type": "object",
        "properties": {
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "hoTen": {
            "type": "string",
            "minLength": 1
          },
          "cccd": {
            "type": "string",
            "minLength": 1
          },
          "ngaySinh": {
            "type": "string",
            "format": "date"
          },
          "gioiTinh": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "chucVu": {
            "type": "string"
          }
        },
        "required": [
          "cccd",
          "hoTen"
        ]
      },
      "NhaCungCapRequest": {
        "type": "object",
        "properties": {
          "tenNcc": {
            "type": "string",
            "minLength": 1
          },
          "diaChi": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "maSoThue": {
            "type": "string"
          },
          "trangThai": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "tenNcc",
          "trangThai"
        ]
      },
      "KhachHangRequest": {
        "type": "object",
        "properties": {
          "hoTen": {
            "type": "string",
            "minLength": 1
          },
          "sdt": {
            "type": "string",
            "minLength": 1
          },
          "email": {
            "type": "string"
          },
          "ngaySinh": {
            "type": "string",
            "format": "date"
          },
          "gioiTinh": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          }
        },
        "required": [
          "hoTen",
          "sdt"
        ]
      },
      "CuaHangRequest": {
        "type": "object",
        "properties": {
          "tenCh": {
            "type": "string",
            "minLength": 1
          },
          "diaChi": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "ngayKhaiTruong": {
            "type": "string",
            "format": "date"
          },
          "trangThai": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "tenCh",
          "trangThai"
        ]
      },
      "BienTheRequest": {
        "type": "object",
        "description": "Request tạo/cập nhật biến thể sản phẩm",
        "properties": {
          "sku": {
            "type": "string",
            "description": "Mã SKU duy nhất",
            "example": "IP15PM-BLK-256",
            "maxLength": 50,
            "minLength": 0
          },
          "barcode": {
            "type": "string",
            "description": "Mã Barcode duy nhất",
            "example": 8931234567890,
            "maxLength": 50,
            "minLength": 0
          },
          "mauSac": {
            "type": "string",
            "description": "Màu sắc",
            "example": "Titan Đen",
            "maxLength": 50,
            "minLength": 0
          },
          "dungLuong": {
            "type": "string",
            "description": "Dung lượng",
            "example": "256GB",
            "maxLength": 50,
            "minLength": 0
          },
          "kichThuoc": {
            "type": "string",
            "description": "Kích thước",
            "example": 6.7,
            "maxLength": 50,
            "minLength": 0
          },
          "giaNhap": {
            "type": "number",
            "description": "Giá nhập",
            "example": 25000000,
            "minimum": 0
          },
          "giaBan": {
            "type": "number",
            "description": "Giá bán",
            "example": 30000000,
            "minimum": 0
          },
          "trangThai": {
            "type": "string",
            "description": "Trạng thái: DangBan, NgungBan",
            "example": "DangBan",
            "minLength": 1
          }
        },
        "required": [
          "giaBan",
          "giaNhap",
          "trangThai"
        ]
      },
      "SanPhamRequest": {
        "type": "object",
        "description": "Request tạo/cập nhật sản phẩm",
        "properties": {
          "maDm": {
            "type": "integer",
            "format": "int64",
            "description": "Mã danh mục sản phẩm",
            "example": 1
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max",
            "maxLength": 200,
            "minLength": 0
          },
          "thuongHieu": {
            "type": "string",
            "description": "Thương hiệu sản phẩm",
            "example": "Apple",
            "maxLength": 100,
            "minLength": 0
          },
          "moTa": {
            "type": "string",
            "description": "Mô tả sản phẩm",
            "example": "Sản phẩm flagship của Apple năm 2023"
          },
          "anh": {
            "type": "string",
            "description": "URL ảnh sản phẩm (secure_url từ Cloudinary)",
            "example": "https://res.cloudinary.com/...",
            "maxLength": 500,
            "minLength": 0
          },
          "trangThai": {
            "type": "string",
            "description": "Trạng thái: DangBan, NgungBan, HetHang",
            "example": "DangBan",
            "minLength": 1
          },
          "variants": {
            "type": "array",
            "description": "Danh sách biến thể đi kèm khi tạo sản phẩm",
            "items": {
              "$ref": "#/components/schemas/BienTheRequest"
}
}
},
"required": [
"maDm",
"tenSp",
"trangThai"
]
},
"ApiResponseUploadImageResponse": {
"type": "object",
"properties": {
"data": {
"$ref": "#/components/schemas/UploadImageResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "UploadImageResponse": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "publicId": {
            "type": "string"
          },
          "width": {
            "type": "integer",
            "format": "int32"
          },
          "height": {
            "type": "integer",
            "format": "int32"
          },
          "format": {
            "type": "string"
          }
        }
      },
      "NhanVienRequest": {
        "type": "object",
        "properties": {
          "tenNhom": {
            "type": "string",
            "minLength": 1
          },
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "hoTen": {
            "type": "string",
            "minLength": 1
          },
          "cccd": {
            "type": "string",
            "minLength": 1
          },
          "ngaySinh": {
            "type": "string",
            "format": "date"
          },
          "gioiTinh": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "chucVu": {
            "type": "string"
          },
          "password": {
            "type": "string",
            "minLength": 1
          },
          "trangThai": {
            "type": "string"
          }
        },
        "required": [
          "cccd",
          "hoTen",
          "password",
          "tenNhom"
        ]
      },
      "ResetPasswordRequest": {
        "type": "object",
        "properties": {
          "oldPassword": {
            "type": "string",
            "minLength": 1
          },
          "newPassword": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "newPassword",
          "oldPassword"
        ]
      },
      "RefreshTokenRequest": {
        "type": "object",
        "properties": {
          "refreshToken": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "refreshToken"
        ]
      },
      "ApiResponseMapStringString": {
        "type": "object",
        "properties": {
          "data": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "properties": {
          "manv": {
            "type": "string",
            "minLength": 1
          },
          "password": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "manv",
          "password"
        ]
      },
      "ApiResponseLoginResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/LoginResponse"
},
"message": {
"type": "string"
},
"success": {
"type": "boolean"
},
"timestamp": {
"type": "string",
"format": "date-time"
}
}
},
"LoginResponse": {
"type": "object",
"properties": {
"accessToken": {
"type": "string"
},
"refreshToken": {
"type": "string"
},
"user": {
"$ref": "#/components/schemas/UserInfo"
          }
        }
      },
      "UserInfo": {
        "type": "object",
        "properties": {
          "matk": {
            "type": "integer",
            "format": "int64"
          },
          "manv": {
            "type": "string"
          },
          "hoten": {
            "type": "string"
          },
          "manhom": {
            "type": "integer",
            "format": "int64"
          },
          "tennhom": {
            "type": "string"
          },
          "chucvu": {
            "type": "string"
          },
          "mach": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ChiTietPhieuNhapRequest": {
        "type": "object",
        "properties": {
          "maBienThe": {
            "type": "integer",
            "format": "int64"
          },
          "soLuong": {
            "type": "integer",
            "format": "int32"
          },
          "donGia": {
            "type": "number"
          }
        }
      },
      "PhieuNhapRequest": {
        "type": "object",
        "properties": {
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "maNcc": {
            "type": "integer",
            "format": "int64"
          },
          "ghiChu": {
            "type": "string"
          },
          "chiTiet": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ChiTietPhieuNhapRequest"
}
}
}
},
"ApiResponseVoid": {
"type": "object",
"properties": {
"data": {

          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponsePageResponseTonKhoTongQuanResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponseTonKhoTongQuanResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "PageResponseTonKhoTongQuanResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TonKhoTongQuanResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "TonKhoTongQuanResponse": {
        "type": "object",
        "description": "Tổng quan tồn kho của một biến thể trên toàn hệ thống (tổng tất cả cửa hàng)",
        "properties": {
          "maBienThe": {
            "type": "integer",
            "format": "int64",
            "description": "Mã biến thể",
            "example": 1
          },
          "sku": {
            "type": "string",
            "description": "Mã SKU",
            "example": "IP15PM-BLK-256"
          },
          "barcode": {
            "type": "string",
            "description": "Mã Barcode",
            "example": 8931234567890
          },
          "maSp": {
            "type": "integer",
            "format": "int64",
            "description": "Mã sản phẩm",
            "example": 1
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max"
          },
          "anhSp": {
            "type": "string",
            "description": "Ảnh sản phẩm"
          },
          "mauSac": {
            "type": "string",
            "description": "Màu sắc",
            "example": "Titan Đen"
          },
          "dungLuong": {
            "type": "string",
            "description": "Dung lượng",
            "example": "256GB"
          },
          "kichThuoc": {
            "type": "string",
            "description": "Kích thước",
            "example": 6.7
          },
          "giaBan": {
            "type": "number",
            "description": "Giá bán",
            "example": 30000000
          },
          "tongSoLuong": {
            "type": "integer",
            "format": "int64",
            "description": "Tổng số lượng tồn kho trên toàn hệ thống",
            "example": 150
          },
          "trangThaiBienThe": {
            "type": "string",
            "description": "Trạng thái biến thể",
            "example": "DangBan"
          }
        }
      },
      "ApiResponsePageResponseTonKhoResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponseTonKhoResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "PageResponseTonKhoResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TonKhoResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "TonKhoResponse": {
        "type": "object",
        "description": "Thông tin tồn kho của một biến thể tại một cửa hàng",
        "properties": {
          "maCh": {
            "type": "integer",
            "format": "int64",
            "description": "Mã cửa hàng",
            "example": 1
          },
          "tenCh": {
            "type": "string",
            "description": "Tên cửa hàng",
            "example": "Cửa hàng Quận 1"
          },
          "maBienThe": {
            "type": "integer",
            "format": "int64",
            "description": "Mã biến thể",
            "example": 1
          },
          "sku": {
            "type": "string",
            "description": "Mã SKU",
            "example": "IP15PM-BLK-256"
          },
          "barcode": {
            "type": "string",
            "description": "Mã Barcode",
            "example": 8931234567890
          },
          "maSp": {
            "type": "integer",
            "format": "int64",
            "description": "Mã sản phẩm",
            "example": 1
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max"
          },
          "anhSp": {
            "type": "string",
            "description": "Ảnh sản phẩm"
          },
          "mauSac": {
            "type": "string",
            "description": "Màu sắc",
            "example": "Titan Đen"
          },
          "dungLuong": {
            "type": "string",
            "description": "Dung lượng",
            "example": "256GB"
          },
          "kichThuoc": {
            "type": "string",
            "description": "Kích thước",
            "example": 6.7
          },
          "giaBan": {
            "type": "number",
            "description": "Giá bán",
            "example": 30000000
          },
          "soLuong": {
            "type": "integer",
            "format": "int32",
            "description": "Số lượng tồn kho",
            "example": 50
          },
          "trangThaiBienThe": {
            "type": "string",
            "description": "Trạng thái biến thể",
            "example": "DangBan"
          }
        }
      },
      "ApiResponseTonKhoTongHopResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/TonKhoTongHopResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "TonKhoTongHopResponse": {
        "type": "object",
        "description": "Tổng hợp tồn kho của một biến thể trên tất cả cửa hàng",
        "properties": {
          "maBienThe": {
            "type": "integer",
            "format": "int64",
            "description": "Mã biến thể",
            "example": 1
          },
          "sku": {
            "type": "string",
            "description": "Mã SKU",
            "example": "IP15PM-BLK-256"
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max"
          },
          "mauSac": {
            "type": "string",
            "description": "Màu sắc",
            "example": "Titan Đen"
          },
          "dungLuong": {
            "type": "string",
            "description": "Dung lượng",
            "example": "256GB"
          },
          "tongSoLuong": {
            "type": "integer",
            "format": "int32",
            "description": "Tổng số lượng trên tất cả cửa hàng",
            "example": 150
          },
          "chiTietCuaHang": {
            "type": "array",
            "description": "Chi tiết tồn kho từng cửa hàng",
            "items": {
              "$ref": "#/components/schemas/TonKhoResponse"
            }
          }
        }
      },
      "Pageable": {
        "type": "object",
        "properties": {
          "page": {
            "type": "integer",
            "format": "int32",
            "minimum": 0
          },
          "size": {
            "type": "integer",
            "format": "int32",
            "minimum": 1
          },
          "sort": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "ApiResponsePageResponseNhanVienResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponseNhanVienResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "NhanVienResponse": {
        "type": "object",
        "properties": {
          "maNv": {
            "type": "string"
          },
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "tenCh": {
            "type": "string"
          },
          "cccd": {
            "type": "string"
          },
          "hoTen": {
            "type": "string"
          },
          "ngaySinh": {
            "type": "string",
            "format": "date"
          },
          "gioiTinh": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "chucVu": {
            "type": "string"
          },
          "maNhom": {
            "type": "integer",
            "format": "int64"
          },
          "tenNhom": {
            "type": "string"
          },
          "trangThai": {
            "type": "string"
          }
        }
      },
      "PageResponseNhanVienResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/NhanVienResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ApiResponseNhanVienResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/NhanVienResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseListNhaCungCap": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/NhaCungCap"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "NhaCungCap": {
        "type": "object",
        "properties": {
          "maNcc": {
            "type": "integer",
            "format": "int64"
          },
          "tenNcc": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "maSoThue": {
            "type": "string"
          },
          "trangThai": {
            "type": "string"
          }
        }
      },
      "ApiResponseNhaCungCap": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/NhaCungCap"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponsePageResponseKhachHang": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponseKhachHang"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "KhachHang": {
        "type": "object",
        "properties": {
          "maKh": {
            "type": "integer",
            "format": "int64"
          },
          "hoTen": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "ngaySinh": {
            "type": "string",
            "format": "date"
          },
          "gioiTinh": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "ngayDangKy": {
            "type": "string",
            "format": "date"
          }
        }
      },
      "PageResponseKhachHang": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/KhachHang"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ApiResponseKhachHang": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/KhachHang"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseListDanhMucResponse": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/DanhMucResponse"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "DanhMucResponse": {
        "type": "object",
        "properties": {
          "maDm": {
            "type": "integer",
            "format": "int64"
          },
          "tenDm": {
            "type": "string"
          },
          "moTa": {
            "type": "string"
          },
          "maDmCha": {
            "type": "integer",
            "format": "int64"
          },
          "tenDmCha": {
            "type": "string"
          }
        }
      },
      "ApiResponseListCuaHang": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CuaHang"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "CuaHang": {
        "type": "object",
        "properties": {
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "tenCh": {
            "type": "string"
          },
          "diaChi": {
            "type": "string"
          },
          "sdt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "ngayKhaiTruong": {
            "type": "string",
            "format": "date"
          },
          "trangThai": {
            "type": "string"
          }
        }
      },
      "ApiResponseCuaHang": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/CuaHang"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseMeResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/MeResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "MeResponse": {
        "type": "object",
        "properties": {
          "matk": {
            "type": "integer",
            "format": "int64"
          },
          "manv": {
            "type": "string"
          },
          "manhom": {
            "type": "integer",
            "format": "int64"
          },
          "tennhom": {
            "type": "string"
          },
          "nhanvien": {
            "$ref": "#/components/schemas/NhanVienInfo"
          }
        }
      },
      "NhanVienInfo": {
        "type": "object",
        "properties": {
          "hoten": {
            "type": "string"
          },
          "chucvu": {
            "type": "string"
          },
          "mach": {
            "type": "integer",
            "format": "int64"
          },
          "sdt": {
            "type": "string"
          },
          "diachi": {
            "type": "string"
          },
          "ngaysinh": {
            "type": "string",
            "format": "date"
          },
          "gioitinh": {
            "type": "string"
          }
        }
      },
      "ApiResponsePageResponsePhieuNhapResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponsePhieuNhapResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "PageResponsePhieuNhapResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PhieuNhapResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "PhieuNhapResponse": {
        "type": "object",
        "properties": {
          "maPn": {
            "type": "integer",
            "format": "int64"
          },
          "maCh": {
            "type": "integer",
            "format": "int64"
          },
          "tenCh": {
            "type": "string"
          },
          "maNcc": {
            "type": "integer",
            "format": "int64"
          },
          "tenNcc": {
            "type": "string"
          },
          "maNv": {
            "type": "string"
          },
          "tenNv": {
            "type": "string"
          },
          "ngayNhap": {
            "type": "string",
            "format": "date-time"
          },
          "tongTien": {
            "type": "number"
          },
          "ghiChu": {
            "type": "string"
          },
          "trangThai": {
            "type": "string"
          }
        }
      },
      "ApiResponsePhieuNhapResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PhieuNhapResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseListChiTietPhieuNhapResponse": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ChiTietPhieuNhapResponse"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ChiTietPhieuNhapResponse": {
        "type": "object",
        "properties": {
          "maPn": {
            "type": "integer",
            "format": "int64"
          },
          "maBienThe": {
            "type": "integer",
            "format": "int64"
          },
          "sku": {
            "type": "string"
          },
          "tenSp": {
            "type": "string"
          },
          "mauSac": {
            "type": "string"
          },
          "dungLuong": {
            "type": "string"
          },
          "kichThuoc": {
            "type": "string"
          },
          "soLuong": {
            "type": "integer",
            "format": "int32"
          },
          "donGia": {
            "type": "number"
          },
          "thanhTien": {
            "type": "number"
          }
        }
      },
      "ApiResponsePageResponseSanPhamResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/PageResponseSanPhamResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "BienTheResponse": {
        "type": "object",
        "description": "Thông tin phản hồi của biến thể sản phẩm",
        "properties": {
          "maBienThe": {
            "type": "integer",
            "format": "int64",
            "description": "Mã biến thể",
            "example": 1
          },
          "maSp": {
            "type": "integer",
            "format": "int64",
            "description": "Mã sản phẩm",
            "example": 1
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max"
          },
          "sku": {
            "type": "string",
            "description": "Mã SKU",
            "example": "IP15PM-BLK-256"
          },
          "barcode": {
            "type": "string",
            "description": "Mã Barcode",
            "example": 8931234567890
          },
          "mauSac": {
            "type": "string",
            "description": "Màu sắc",
            "example": "Titan Đen"
          },
          "dungLuong": {
            "type": "string",
            "description": "Dung lượng",
            "example": "256GB"
          },
          "kichThuoc": {
            "type": "string",
            "description": "Kích thước",
            "example": 6.7
          },
          "giaNhap": {
            "type": "number",
            "description": "Giá nhập",
            "example": 25000000
          },
          "giaBan": {
            "type": "number",
            "description": "Giá bán",
            "example": 30000000
          },
          "trangThai": {
            "type": "string",
            "description": "Trạng thái",
            "example": "DangBan"
          }
        }
      },
      "CategoryInfo": {
        "type": "object",
        "description": "Thông tin danh mục của sản phẩm",
        "properties": {
          "maDm": {
            "type": "integer",
            "format": "int64",
            "description": "Mã danh mục",
            "example": 12
          },
          "tenDm": {
            "type": "string",
            "description": "Tên danh mục",
            "example": "Laptop"
          },
          "maDmCha": {
            "type": "integer",
            "format": "int64",
            "description": "Mã danh mục cha",
            "example": 2
          },
          "tenDmCha": {
            "type": "string",
            "description": "Tên danh mục cha",
            "example": "Máy tính"
          }
        }
      },
      "PageResponseSanPhamResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SanPhamResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "SanPhamResponse": {
        "type": "object",
        "description": "Thông tin phản hồi của sản phẩm",
        "properties": {
          "maSp": {
            "type": "integer",
            "format": "int64",
            "description": "Mã sản phẩm",
            "example": 1
          },
          "tenSp": {
            "type": "string",
            "description": "Tên sản phẩm",
            "example": "iPhone 15 Pro Max"
          },
          "thuongHieu": {
            "type": "string",
            "description": "Thương hiệu",
            "example": "Apple"
          },
          "moTa": {
            "type": "string",
            "description": "Mô tả sản phẩm"
          },
          "anh": {
            "type": "string",
            "description": "URL ảnh sản phẩm"
          },
          "trangThai": {
            "type": "string",
            "description": "Trạng thái",
            "example": "DangBan"
          },
          "category": {
            "$ref": "#/components/schemas/CategoryInfo",
            "description": "Thông tin danh mục"
          },
          "variantSummary": {
            "$ref": "#/components/schemas/VariantSummary",
            "description": "Tóm tắt thông tin biến thể"
          },
          "variants": {
            "type": "array",
            "description": "Danh sách các biến thể của sản phẩm",
            "items": {
              "$ref": "#/components/schemas/BienTheResponse"
            }
          }
        }
      },
      "VariantSummary": {
        "type": "object",
        "description": "Tóm tắt thông tin biến thể của sản phẩm",
        "properties": {
          "totalVariants": {
            "type": "integer",
            "format": "int32",
            "description": "Tổng số biến thể",
            "example": 4
          },
          "activeVariants": {
            "type": "integer",
            "format": "int32",
            "description": "Số biến thể đang hoạt động (DangBan)",
            "example": 3
          },
          "minGiaBan": {
            "type": "number",
            "description": "Giá bán thấp nhất",
            "example": 24990000
          },
          "maxGiaBan": {
            "type": "number",
            "description": "Giá bán cao nhất",
            "example": 32990000
          },
          "minGiaNhap": {
            "type": "number",
            "description": "Giá nhập thấp nhất",
            "example": 21000000
          },
          "maxGiaNhap": {
            "type": "number",
            "description": "Giá nhập cao nhất",
            "example": 28000000
          }
        }
      },
      "ApiResponseSanPhamResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/SanPhamResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseListBienTheResponse": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BienTheResponse"
            }
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseBienTheResponse": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/BienTheResponse"
          },
          "message": {
            "type": "string"
          },
          "success": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "securitySchemes": {
      "Bearer Authentication": {
        "type": "http",
        "description": "Nhập accessToken (không cần prefix \"Bearer \")",
        "name": "Bearer Authentication",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }

}
}
