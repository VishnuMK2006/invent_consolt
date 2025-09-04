import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Row,
  Col,
  ListGroup,
  Spinner,
  Badge
} from "react-bootstrap";
import { salesAPI, buyersAPI, productsAPI } from "../services/api";
import Quagga from "quagga";
import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const scannerFlash = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const AnimatedContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  background: white;
  height: 100px;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease-out;
`;

const StyledTable = styled(Table)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  
  thead {
    background: linear-gradient(to right, #3498db);
    color: white;
    
    th {
        background: linear-gradient(to right, #3498db);
      border: none;
      padding: 1.2rem;
      font-weight: 500;
    }
  }
  
  tbody tr {
    transition: all 0.3s ease;
    
    &:hover {
    background: linear-gradient(to right, #3498db);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    td {
      padding: 1.2rem;
      border-color: #e9ecef;
    }
  }
`;

const PrimaryButton = styled(Button)`
        background: linear-gradient(to right, #3498db);
  border: none;
  border-radius: 25px;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    background: linear-gradient(to right, #3498db, #2ecc71);
  }
`;

const SecondaryButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid #667eea;
  color: #667eea;
  background: transparent;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const SuccessButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  border: 2px solid #48bb78;
  color: #48bb78;
  background: transparent;
  
  &:hover {
    background: #48bb78;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  }
`;

const DangerButton = styled(Button)`
  border-radius: 20px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    animation: ${pulse} 0.6s ease;
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }
`;

const ScannerButton = styled(Button)`
  border-radius: 20px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.$active ? css`
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
      transform: translateY(-2px);
    }
  ` : css`
        background: linear-gradient(to right, #3498db);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    
    &:hover {
        background: linear-gradient(to right, #3498db);
      transform: translateY(-2px);
    }
  `}
`;

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    background: linear-gradient(to right, #3498db);
    color: white;
    border-radius: 20px 20px 0 0;
    border: none;
    padding: 0.75rem 1rem;
    
    .btn-close {
      filter: invert(1);
    }
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.5rem 1rem;
    border-top: 1px solid #e9ecef;
  }
`;

const ScannerContainer = styled.div`
  width: 100%;
  height: 250px;
  background: #000;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #00ff00;
    border-radius: 10px;
    animation: ${scannerFlash} 2s ease-in-out infinite;
    pointer-events: none;
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1rem;
  
  .form-label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  
  .form-control, .form-select {
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    padding: 0.6rem;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
  }
`;

const ItemList = styled(ListGroup)`
  .list-group-item {
    border-radius: 10px;
    margin-bottom: 0.5rem;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f7fafc;
      transform: translateX(5px);
    }
  }
`;

const TotalDisplay = styled.h5`
        background: linear-gradient(to right, #3498db);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 15px;
  text-align: center;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  font-weight: bold;
  animation: ${pulse} 2s infinite;
`;

const LoadingSpinner = styled(Spinner)`
  color: #667eea;
  width: 3rem;
  height: 3rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
`;

const BarcodeBadge = styled(Badge)`
        background: linear-gradient(to right, #3498db);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
`;

const ScannerStatus = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background: ${props => props.$active ? '#48bb78' : '#e53e3e'};
  color: white;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const LowStockAlert = styled(Alert)`
  border-left: 4px solid #f56565;
  background-color: #fff5f5;
  color: #c53030;
  font-weight: 500;
  animation: ${pulse} 2s;
`;

// Fixed TableRow component without inline animation
const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
        background: linear-gradient(to right, #3498db);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  td {
    padding: 1.2rem;
    border-color: #e9ecef;
  }
`;


//logic
const Sales = () => {
  const [sales, setSales] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemIndex, setDeleteItemIndex] = useState(null);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(null);
  const [products, setProducts] = useState([]);

  const scannerRef = useRef(null);

  // Initialize formData with all required fields
  const [formData, setFormData] = useState({
    buyer: "",
    saleDate: new Date().toISOString().split("T")[0],
    items: [],
    subtotal: 0,
    discount: 0,
    discountAmount: 0,
    tax: 0,
    taxAmount: 0,
    shipping: 0,
    other: 0,
    total: 0,
    comments: ""
  });

  useEffect(() => {
    fetchData();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSales(), fetchBuyers(), fetchProducts()]);
      console.log("completed");
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll();
      
      setSales(response.data);
    } catch (error) {
      setError("Failed to fetch sales");
    }
  };

  const fetchBuyers = async () => {
    try {
      const response = await buyersAPI.getAll();
      setBuyers(response.data);
    } catch (error) {
      console.error("Failed to fetch buyers");
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      console.log("Products fetched successfully:", response.data.length);
      console.log("Sample product:", response.data[0]);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    setFormData({
      buyer: "",
      saleDate: new Date().toISOString().split("T")[0],
      items: [],
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      tax: 0,
      taxAmount: 0,
      shipping: 0,
      other: 0,
      total: 0,
      comments: ""
    });
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    stopScanner();
    setError(""); // Clear any error messages when closing modal
  };

  // Updated handleInputChange to handle calculations
  const handleInputChange = (name, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Recalculate all derived values when relevant fields change
      if (['discount', 'tax', 'shipping', 'other'].includes(name) || name === 'items') {
        return calculateTotals(updatedData);
      }
      
      return updatedData;
    });
  };

  // Add this calculation function
  const calculateTotals = (data) => {
    // Calculate subtotal from items
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 1)), 0);
    
    // Calculate discount amount (percentage of subtotal)
    const discountAmount = subtotal * (data.discount / 100);
    
    // Calculate taxable amount (subtotal minus discount)
    const taxableAmount = subtotal - discountAmount;
    
    // Calculate tax amount (percentage of taxable amount)
    const taxAmount = taxableAmount * (data.tax / 100);
    
    // Calculate final total
    const total = taxableAmount + taxAmount + Number(data.shipping) + Number(data.other);
    
    // Return updated data with all calculated values
    return {
      ...data,
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  };

  // Start Quagga Scanner
  const startScanner = () => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "upc_reader",
              "code_39_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            setError("Unable to start scanner: " + err);
            return;
          }
          Quagga.start();
          setScannerActive(true);
        }
      );

      Quagga.onDetected((data) => {
        if (data && data.codeResult && data.codeResult.code) {
          setScannedCode(data.codeResult.code);
        }
      });
    }
  };

  // Stop Scanner
  const stopScanner = () => {
    try {
      Quagga.stop();
      setScannerActive(false);
    } catch { }
  };

  // Add Item (auto on scan)
  useEffect(() => {
    const addScannedItem = async () => {
      if (!scannedCode) return;
      try {
        // First, try to get product directly from products using the barcode
        const productMatch = products.find(p => p.barcode === scannedCode);
        
        if (productMatch) {
          // We found a matching product in our already fetched products
          const enhancedProduct = {
            _id: productMatch._id,
            name: productMatch.name,
            category: productMatch.category || 'Unknown',
            description: productMatch.description || '',
            currentStock: productMatch.quantity || 0,
            minStock: productMatch.minquantity || 0,
            price: productMatch.price
          };
          
          // Check if this product is at or below minimum stock level
          if (productMatch.quantity <= productMatch.minquantity) {
            setLowStockAlert({
              productName: productMatch.name,
              currentStock: productMatch.quantity,
              minStock: productMatch.minquantity
            });
            
            // Auto-dismiss low stock alert after 5 seconds
            setTimeout(() => {
              setLowStockAlert(null);
            }, 5000);
          }
          
          setFormData((prev) => {
            // Check if this barcode already exists in items
            const existingItemIndex = prev.items.findIndex(item => item.barcode === scannedCode);
            
            let newItems = [...prev.items];
            
            if (existingItemIndex !== -1) {
              // Increment quantity of existing item
              newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: (newItems[existingItemIndex].quantity || 1) + 1
              };
            } else {
              // Add new item with enhanced product details
              newItems.push({
                product: enhancedProduct._id,
                productData: enhancedProduct,
                quantity: 1,
                unitPrice: enhancedProduct.price,
                barcode: scannedCode,
              });
            }
            
            // Recalculate totals with new items
            return calculateTotals({
              ...prev,
              items: newItems
            });
          });
          
          setScannedCode("");
          setError("");
        } else {
          // If not found in cached products, try to fetch the product by barcode
          try {
            const productResponse = await productsAPI.getByBarcode(scannedCode);
            if (productResponse.data) {
              const productDetails = productResponse.data;
              
              // Create enhanced product object
              const enhancedProduct = {
                _id: productDetails._id,
                name: productDetails.name || 'Unknown Product',
                category: productDetails.category || 'Unknown',
                description: productDetails.description || '',
                currentStock: productDetails.quantity || 0,
                minStock: productDetails.minquantity || 0,
                price: productDetails.price
              };
              
              // Check for low stock
              if (productDetails.quantity <= productDetails.minquantity) {
                setLowStockAlert({
                  productName: enhancedProduct.name,
                  currentStock: productDetails.quantity,
                  minStock: productDetails.minquantity
                });
                
                setTimeout(() => {
                  setLowStockAlert(null);
                }, 5000);
              }
              
              setFormData((prev) => {
                // Check if this barcode already exists in items
                const existingItemIndex = prev.items.findIndex(item => item.barcode === scannedCode);
                
                let newItems = [...prev.items];
                
                if (existingItemIndex !== -1) {
                  // Increment quantity of existing item
                  newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: (newItems[existingItemIndex].quantity || 1) + 1
                  };
                } else {
                  // Add new item with enhanced product details
                  newItems.push({
                    product: enhancedProduct._id,
                    productData: enhancedProduct,
                    quantity: 1,
                    unitPrice: enhancedProduct.price,
                    barcode: scannedCode,
                  });
                }
                
                // Recalculate totals with new items
                return calculateTotals({
                  ...prev,
                  items: newItems
                });
              });
              
              setScannedCode("");
              setError("");
            } else {
              // If product not found by barcode, fall back to the sales API scan endpoint
              fallbackToSalesAPI();
            }
          } catch (err) {
            // If there's an error getting product by barcode, fall back to sales API
            fallbackToSalesAPI();
          }
        }
        
        // Stop and restart scanner to prevent duplicate scans
        stopScanner();
        setTimeout(() => {
          startScanner();
        }, 500); // short delay to allow camera to reset
      } catch (error) {
        setError(`Invalid or sold barcode: ${scannedCode}`);
        setScannedCode(""); // Clear the code after error
        
        // Auto-dismiss error after 3 seconds
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    };
    
    // Helper function to use the sales API as fallback
    const fallbackToSalesAPI = async () => {
      try {
        const response = await salesAPI.scanBarcode({ barcode: scannedCode });
        const scannedItem = response.data;
        
        // Get more detailed product info if available
        let productDetails = null;
        try {
          if (scannedItem && scannedItem.product && scannedItem.product._id) {
            const productResponse = await productsAPI.getById(scannedItem.product._id);
            productDetails = productResponse.data;
          }
        } catch (productError) {
          console.error("Failed to fetch detailed product info:", productError);
        }
        
        // Combine the product data from the scan response with our additional product details
        const enhancedProduct = {
          ...scannedItem.product,
          name: productDetails?.name || scannedItem.product?.name || 'Unknown Product',
          category: productDetails?.category || scannedItem.product?.category || 'Unknown',
          description: productDetails?.description || scannedItem.product?.description || '',
          currentStock: productDetails?.quantity || 0,
          minStock: productDetails?.minquantity || 0
        };
        
        // Check for low stock
        if (productDetails && productDetails.quantity <= productDetails.minquantity) {
          setLowStockAlert({
            productName: enhancedProduct.name,
            currentStock: productDetails.quantity,
            minStock: productDetails.minquantity
          });
          
          setTimeout(() => {
            setLowStockAlert(null);
          }, 5000);
        }
        
        setFormData((prev) => {
          // Check if this barcode already exists in items
          const existingItemIndex = prev.items.findIndex(item => item.barcode === scannedCode);
          
          let newItems = [...prev.items];
          
          if (existingItemIndex !== -1) {
            // Increment quantity of existing item
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: (newItems[existingItemIndex].quantity || 1) + 1
            };
          } else {
            // Add new item with enhanced product details
            newItems.push({
              product: enhancedProduct._id, // Store just the ID for submission
              productData: enhancedProduct, // Store full object for display
              quantity: 1,
              unitPrice: scannedItem.price,
              barcode: scannedCode,
            });
          }
          
          // Recalculate totals with new items
          return calculateTotals({
            ...prev,
            items: newItems
          });
        });
        
        setScannedCode("");
        setError(""); // Clear any previous errors
      } catch (error) {
        setError(`Invalid or sold barcode: ${scannedCode}`);
        setScannedCode(""); // Clear the code after error
        
        // Auto-dismiss error after 3 seconds
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    };
    
    addScannedItem();
    // Only run when scannedCode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedCode]);

  const removeItem = (index) => {
    const item = formData.items[index];
    
    // If quantity is more than 1, show the delete confirmation modal
    if (item.quantity > 1) {
      setDeleteItemIndex(index);
      setDeleteQuantity(1); // Reset to 1
      setShowDeleteModal(true);
    } else {
      // For single quantity items, delete directly
      deleteItemCompletely(index);
    }
  };
  
  const deleteItemCompletely = (index) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return calculateTotals({
        ...prev,
        items: newItems
      });
    });
  };
  
  const handlePartialDelete = () => {
    if (deleteItemIndex === null) return;
    
    setFormData((prev) => {
      const newItems = [...prev.items];
      const item = newItems[deleteItemIndex];
      
      // If user wants to delete all or more than available
      if (deleteQuantity >= item.quantity) {
        // Remove the entire item
        newItems.splice(deleteItemIndex, 1);
      } else {
        // Reduce the quantity
        newItems[deleteItemIndex] = {
          ...item,
          quantity: item.quantity - deleteQuantity
        };
      }
      
      // Hide modal and reset state
      setShowDeleteModal(false);
      setDeleteItemIndex(null);
      
      return calculateTotals({
        ...prev,
        items: newItems
      });
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.unitPrice * (item.quantity || 1),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.buyer || formData.items.length === 0) {
      setError("Buyer and at least one item are required");
      // Auto-dismiss validation error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Create a properly formatted object for the API
      const formattedData = {
        ...formData,
        // Map items to the format expected by the API
        items: formData.items.map(item => ({
          product: item.product, // Just send the ID
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          barcode: item.barcode // Include barcode in the API request
        }))
      };
      
      await salesAPI.create(formattedData);
      setSuccess("Sale created successfully");
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      fetchSales();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create sale");
      // Auto-dismiss error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (sale) => {
    try {
      const response = await salesAPI.getById(sale._id);
      setSelectedSale(response.data);
      setShowViewModal(true);
    } catch (error) {
      setError("Failed to fetch sale details");
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await salesAPI.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sale-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Failed to download invoice");
    }
  };

  if (loading && sales.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        <LoadingSpinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <AnimatedContainer>
        <HeaderSection>
          <Row className="">
            <Col>
              <h4 className="mb-0 d-flex align-items-center">
                <IconWrapper style={{ fontSize: "1.3rem", marginRight: "0.6rem" }}>🛒</IconWrapper>
                Sales Management
              </h4>
            </Col>
            <Col xs="auto">
              <PrimaryButton
                onClick={handleShowModal}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.9rem",
                  borderRadius: "6px"
                }}
              >
                + New Sale
              </PrimaryButton>
            </Col>
          </Row>
        </HeaderSection>

        {success && <Alert variant="success">{success}</Alert>}

        <StyledTable responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <TableRow key={sale._id}>
                <td><strong>{sale.saleId}</strong></td>
                <td>{sale.buyer?.name}</td>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>₹{sale.totalAmount.toFixed(2)}</td>
                <td>
                  <SecondaryButton size="sm" className="me-2" onClick={() => handleView(sale)}>
                    👁️ View
                  </SecondaryButton>
                  <SuccessButton size="sm" onClick={() => handleDownloadInvoice(sale._id)}>
                    📄 Invoice
                  </SuccessButton>
                </td>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>

        {/* New Sale Modal */}
        <StyledModal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Sale</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pb-0">
              <Row>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <Form.Label>Buyer</Form.Label>
                    <Form.Select
                      name="buyer"
                      value={formData.buyer}
                      onChange={(e) => handleInputChange("buyer", e.target.value)}
                      required
                    >
                      <option value="">Select Buyer</option>
                      {buyers.map((buyer) => (
                        <option key={buyer._id} value={buyer._id}>
                          {buyer.name}
                        </option>
                      ))}
                    </Form.Select>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <Form.Label>Sale Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={(e) => handleInputChange("saleDate", e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <div className="mb-3">
                <h5 className="mb-2">Scan Items</h5>

                <ScannerStatus $active={scannerActive} className="mb-2">
                  {scannerActive ? '🟢 Scanner Active' : '🔴 Scanner Inactive'}
                </ScannerStatus>

                {error && (
                  <Alert 
                    variant="danger" 
                    className="py-2 mb-2"
                  >
                    {error}
                  </Alert>
                )}
                
                {lowStockAlert && (
                  <LowStockAlert className="py-2 mb-2">
                    <div className="d-flex align-items-center">
                      <span className="me-2">⚠️</span>
                      <div>
                        <strong>Low Stock Alert:</strong> {lowStockAlert.productName} has reached the minimum stock level. 
                        <div><small>Current stock: {lowStockAlert.currentStock}, Minimum: {lowStockAlert.minStock}</small></div>
                      </div>
                    </div>
                  </LowStockAlert>
                )}

                <ScannerContainer ref={scannerRef} style={{marginBottom: '0.5rem'}} />

                <div className="d-flex gap-2 mb-2">
                  <ScannerButton
                    $active={scannerActive}
                    onClick={scannerActive ? stopScanner : startScanner}
                  >
                    {scannerActive ? '⏹️' : '📷'}
                    {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                  </ScannerButton>
                </div>

                {/* Barcode Input */}
                <FormGroup className="mb-3">
                  <Form.Label>Scanned Barcode</Form.Label>
                  <Form.Control
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Scan or enter barcode"
                  />
                </FormGroup>
              </div>

              <h6 className="mb-2">Scanned Items ({formData.items.length})</h6>
              
              <Table bordered responsive className="mb-3">
                <thead className="bg-light">
                  <tr>
                    <th>S.No</th>
                    <th>Barcode</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                    <th>Qty</th>
                    <th>Total (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className={item.productData?.currentStock <= item.productData?.minStock ? 'table-warning' : ''}>
                      <td>{index + 1}</td>
                      <td><BarcodeBadge>{item.barcode}</BarcodeBadge></td>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{item.productData?.name || 'N/A'}</div>
                        {item.productData?.description && (
                          <small className="text-muted">{item.productData.description.substring(0, 30)}{item.productData.description.length > 30 ? '...' : ''}</small>
                        )}
                      </td>
                      <td>{item.productData?.category || 'Unknown'}</td>
                      <td>{item.unitPrice.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.unitPrice * item.quantity).toFixed(2)}</td>
                      <td>
                        <DangerButton variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                          Remove
                        </DangerButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="text-end"><strong>Subtotal:</strong></td>
                    <td><strong>₹{formData.subtotal.toFixed(2)}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>

              {/* Totals Section */}
              <div className="mb-3">
                <h5 className="mb-2">Order Summary</h5>
                <Row className="g-2">
                  <Col md={3}>
                    <div className="total-item p-2 border rounded">
                      <Form.Label className="mb-1 small">Discount (%)</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          className="me-2"
                          size="sm"
                          style={{width: '60px'}}
                          value={formData.discount}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            // Ensure discount is between 0 and 100
                            handleInputChange("discount", isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
                          }}
                        />
                        <span style={{color: "#28a745", fontSize: "0.9rem"}}>
                          -₹{formData.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="total-item p-2 border rounded">
                      <Form.Label className="mb-1 small">Tax (%)</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          className="me-2"
                          size="sm"
                          style={{width: '60px'}}
                          value={formData.tax}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            handleInputChange("tax", isNaN(value) ? 0 : value);
                          }}
                        />
                        <span style={{color: "#007bff", fontSize: "0.9rem"}}>
                          +₹{formData.taxAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="total-item p-2 border rounded">
                      <Form.Label className="mb-1 small">Shipping</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={formData.shipping}
                        onChange={(e) => {
                          handleInputChange("shipping", Number.parseFloat(e.target.value) || 0);
                        }}
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="total-item p-2 border rounded">
                      <Form.Label className="mb-1 small">Other</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={formData.other}
                        onChange={(e) => {
                          handleInputChange("other", Number.parseFloat(e.target.value) || 0);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                
                <div className="total-final mt-3 p-2 bg-primary text-white rounded text-center">
                  <h5 className="mb-0">Final Total: ₹{formData.total.toFixed(2)}</h5>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-3">
                <h5 className="mb-2">Comments</h5>
                <Form.Control
                  as="textarea"
                  placeholder="Comments or Special Instructions"
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  rows={3}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <SecondaryButton onClick={handleCloseModal}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Create Sale'}
              </PrimaryButton>
            </Modal.Footer>
          </Form>
        </StyledModal>

        {/* Delete Item Confirmation Modal */}
        <StyledModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          size="sm" 
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Remove Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteItemIndex !== null && (
              <>
                <p>This item has a quantity of <strong>{formData.items[deleteItemIndex]?.quantity}</strong>.</p>
                <p>How many units would you like to remove?</p>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity to remove:</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={formData.items[deleteItemIndex]?.quantity || 1}
                    value={deleteQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0 && val <= formData.items[deleteItemIndex]?.quantity) {
                        setDeleteQuantity(val);
                      }
                    }}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </SecondaryButton>
                  <DangerButton onClick={handlePartialDelete}>
                    Remove
                  </DangerButton>
                </div>
              </>
            )}
          </Modal.Body>
        </StyledModal>

        {/* View Sale Modal */}
        <StyledModal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Sale Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSale && (
              <>
                <Row>
                  <Col md={6}>
                    <h6>Sale Information</h6>
                    <p><strong>ID:</strong> {selectedSale.saleId}</p>
                    <p><strong>Date:</strong> {new Date(selectedSale.saleDate).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Buyer Details</h6>
                    <p><strong>Name:</strong> {selectedSale.buyer.name}</p>
                    <p><strong>Email:</strong> {selectedSale.buyer.email}</p>
                    <p><strong>Phone:</strong> {selectedSale.buyer.phone}</p>
                  </Col>
                </Row>

                <h6 className="mt-4">Items</h6>
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.items || []).map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{item.product?.name || '-'}</td>
                        <td><BarcodeBadge>{item.barcode || item.product?.barcode || '-'}</BarcodeBadge></td>
                        <td>₹{item.unitPrice?.toFixed(2) ?? '-'}</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-end"><strong>Subtotal:</strong></td>
                      <td><strong>₹{selectedSale.subtotal?.toFixed(2) || selectedSale.subtotalAmount?.toFixed(2) || selectedSale.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
                
                <Row className="mt-3">
                  <Col md={3}>
                    <div className="p-2 border rounded text-center">
                      <small>Discount</small>
                      <p className="mb-0 text-success">-₹{selectedSale.discountAmount?.toFixed(2) || selectedSale.discount?.toFixed(2) || "0.00"}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 border rounded text-center">
                      <small>Tax</small>
                      <p className="mb-0 text-primary">+₹{selectedSale.taxAmount?.toFixed(2) || selectedSale.tax?.toFixed(2) || "0.00"}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 border rounded text-center">
                      <small>Shipping</small>
                      <p className="mb-0">₹{selectedSale.shippingAmount?.toFixed(2) || selectedSale.shipping?.toFixed(2) || "0.00"}</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-2 border rounded text-center">
                      <small>Other</small>
                      <p className="mb-0">₹{selectedSale.otherAmount?.toFixed(2) || selectedSale.other?.toFixed(2) || "0.00"}</p>
                    </div>
                  </Col>
                </Row>
                
                <TotalDisplay className="mt-4">Total: ₹{selectedSale.totalAmount.toFixed(2)}</TotalDisplay>
              </>
            )}
          </Modal.Body>
        </StyledModal>
      </AnimatedContainer>
    </Container>
  );
};

export default Sales;