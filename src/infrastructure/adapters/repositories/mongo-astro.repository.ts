import { MongoClient, ObjectId } from 'mongodb';

export class MongoAstroRepository {
  private client: MongoClient;
  private collection;

  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
    this.collection = this.db('daily-sorte').collection('natal-charts');
  }

  private db(name: string) {
    return this.client.db(name);
  }

  async saveChart(chart: any): Promise<ObjectId> {
    const result = await this.collection.insertOne({
      ...chart,
      calculatedAt: chart.calculatedAt || new Date(),
      createdAt: new Date(),
    });
    return result.insertedId;
  }

  async findLatest(): Promise<any[]> {
    const results = await this.collection
      .find()
      .sort({ calculatedAt: -1 })
      .limit(5)
      .toArray();
    return results.map((r) => ({ ...r, _id: r._id as ObjectId }));
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}