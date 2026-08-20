import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Material {
  id?: string;
  name: string;
  quantity: string;
  assignedTo: string;
  obtained: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
  private firestore = inject(Firestore);
  private zone = inject(NgZone);

  getMaterials(projectId: string): Observable<Material[]> {
    const materialsRef = collection(this.firestore, `projects/${projectId}/materials`);
    
    return new Observable<Material[]>(subscriber => {
      const unsubscribe = onSnapshot(materialsRef, 
        (snap) => {
          const materials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
          this.zone.run(() => subscriber.next(materials));
        },
        (error) => this.zone.run(() => subscriber.error(error))
      );
      return () => unsubscribe();
    });
  }

  async addMaterial(projectId: string, material: Partial<Material>) {
    const materialsRef = collection(this.firestore, `projects/${projectId}/materials`);
    return addDoc(materialsRef, {
      ...material,
      obtained: material.obtained ?? false
    });
  }

  async updateMaterial(projectId: string, materialId: string, data: Partial<Material>) {
    const materialRef = doc(this.firestore, `projects/${projectId}/materials/${materialId}`);
    return updateDoc(materialRef, data);
  }

  async deleteMaterial(projectId: string, materialId: string) {
    const materialRef = doc(this.firestore, `projects/${projectId}/materials/${materialId}`);
    return deleteDoc(materialRef);
  }
}
