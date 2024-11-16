import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/hooks/store';

const RateCardTable = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [isEditing, setIsEditing] = useState(false);
  const [prices, setPrices] = useState({
    photoEditing: {
      easy: { value: '', exists: false },
      medium: { value: '', exists: false },
      hard: { value: '', exists: false },
    },
    graphicDesign: {
      easy: { value: '', exists: false },
      medium: { value: '', exists: false },
      hard: { value: '', exists: false },
    },
    videoEditing: {
      easy: { value: '', exists: false },
      medium: { value: '', exists: false },
      hard: { value: '', exists: false },
    },
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const categories = ['photoEditing', 'graphicDesign', 'videoEditing'];
      const difficulties = ['easy', 'medium', 'hard'];
      const newPrices = { ...prices };

      for (const category of categories) {
        for (const difficulty of difficulties) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/prices/${category}/${difficulty}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data && response.data.price) {
              newPrices[category][difficulty] = { value: response.data.price, exists: true };
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              newPrices[category][difficulty] = { value: '', exists: false };
            } else {
              console.error('Error fetching price:', error);
            }
          }
        }
      }

      setPrices(newPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleInputChange = (category: string, difficulty: string, value: string) => {
    setPrices((prevPrices) => ({
      ...prevPrices,
      [category]: {
        ...prevPrices[category],
        [difficulty]: {
          ...prevPrices[category][difficulty],
          value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      for (const category in prices) {
        for (const difficulty in prices[category]) {
          const priceData = prices[category][difficulty];
          const { value, exists } = priceData;
          const endpoint = exists ? '/api/prices/update' : '/api/prices/set';
          await axios({
            method: exists ? 'put' : 'post',
            url: `${import.meta.env.VITE_API_URL}${endpoint}`,
            data: { category, difficulty, price: value },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
      setIsEditing(false);
      alert("prices have been saved");
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  };

  const renderCell = (category: string, difficulty: string) => {
    const priceData = prices[category][difficulty];
    if (isEditing) {
      return (
        <Input
          value={priceData.value}
          onChange={(e) => handleInputChange(category, difficulty, e.target.value)}
        />
      );
    }
    return priceData.value;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Easy</TableHead>
            <TableHead>Medium</TableHead>
            <TableHead>Hard</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Photo Editing</TableCell>
            <TableCell>{renderCell('photoEditing', 'easy')}</TableCell>
            <TableCell>{renderCell('photoEditing', 'medium')}</TableCell>
            <TableCell>{renderCell('photoEditing', 'hard')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Graphic Design</TableCell>
            <TableCell>{renderCell('graphicDesign', 'easy')}</TableCell>
            <TableCell>{renderCell('graphicDesign', 'medium')}</TableCell>
            <TableCell>{renderCell('graphicDesign', 'hard')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Video Editing</TableCell>
            <TableCell>{renderCell('videoEditing', 'easy')}</TableCell>
            <TableCell>{renderCell('videoEditing', 'medium')}</TableCell>
            <TableCell>{renderCell('videoEditing', 'hard')}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {isEditing ? (
        <Button onClick={handleSave} className="mt-4">Save</Button>
      ) : (
        <Button onClick={() => setIsEditing(true)} className="mt-4">Edit Prices</Button>
      )}
    </div>
  );
};

export default RateCardTable;