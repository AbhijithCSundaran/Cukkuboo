import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'content-loader',
  imports: [CommonModule],
  templateUrl: './content-loader.component.html',
  styleUrl: './content-loader.component.scss'
})
export class ContentLoaderComponent {
  @Input() title: string = '';

}
