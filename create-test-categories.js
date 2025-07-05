// Simple script to create test categories
const createCategories = async () => {
  try {
    // Create main category
    const mainCategoryResponse = await fetch('http://localhost:3001/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Technology',
        slug: 'technology',
        color: '#0066cc'
      })
    });

    if (!mainCategoryResponse.ok) {
      console.log('Failed to create main category:', await mainCategoryResponse.text());
      return;
    }

    const mainCategory = await mainCategoryResponse.json();
    console.log('Created main category:', mainCategory);

    // Create subcategories
    const subcategories = [
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Mobile Apps', slug: 'mobile-apps' },
      { name: 'Software Tools', slug: 'software-tools' }
    ];

    for (const sub of subcategories) {
      const subResponse = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sub.name,
          slug: sub.slug,
          parent: mainCategory.doc.id
        })
      });

      if (subResponse.ok) {
        const subCategory = await subResponse.json();
        console.log('Created subcategory:', subCategory.doc.name);
      } else {
        console.log('Failed to create subcategory:', sub.name, await subResponse.text());
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

createCategories();
